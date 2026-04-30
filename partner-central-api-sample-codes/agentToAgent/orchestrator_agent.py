#!/usr/bin/env python
"""
Orchestrator Agent - Agent-to-Agent Communication

This agent:
1. Reads context from multiple sources (Slack, local files, uploads)
2. Uses Claude AI to generate "next steps" content
3. Calls Partner Central MCP to update the opportunity
"""

import os
import json
import logging
import argparse
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class ContextSource:
    """Represents a source of context data"""
    source_type: str  # 'slack', 'file', 'upload'
    source_name: str
    content: str
    metadata: Dict = field(default_factory=dict)


@dataclass
class AgentResult:
    """Result from the orchestrator agent"""
    success: bool
    next_steps: str
    context_sources: List[ContextSource]
    mcp_response: Optional[Dict] = None
    error: Optional[str] = None


class SlackReader:
    """Read messages from Slack channels"""
    
    def __init__(self, token: str = None):
        self.token = token or os.environ.get('SLACK_BOT_TOKEN')
        self._client = None
    
    @property
    def client(self):
        if self._client is None and self.token:
            try:
                from slack_sdk import WebClient
                self._client = WebClient(token=self.token)
            except ImportError:
                logger.warning("slack_sdk not installed. Run: pip install slack_sdk")
        return self._client
    
    def read_channel(self, channel: str, limit: int = 50) -> ContextSource:
        """Read recent messages from a Slack channel"""
        if not self.client:
            logger.warning(f"Slack client not available, skipping channel: {channel}")
            return ContextSource(
                source_type='slack',
                source_name=channel,
                content=f"[Slack integration not configured for channel: {channel}]",
                metadata={'error': 'No Slack token'}
            )
        
        try:
            # Get channel ID if name provided
            channel_id = channel
            if not channel.startswith('C'):
                channels = self.client.conversations_list()
                for ch in channels['channels']:
                    if ch['name'] == channel:
                        channel_id = ch['id']
                        break
            
            # Fetch messages
            result = self.client.conversations_history(
                channel=channel_id,
                limit=limit
            )
            
            messages = []
            for msg in result.get('messages', []):
                text = msg.get('text', '')
                user = msg.get('user', 'unknown')
                ts = msg.get('ts', '')
                messages.append(f"[{user}]: {text}")
            
            content = "\n".join(messages)
            
            return ContextSource(
                source_type='slack',
                source_name=channel,
                content=content,
                metadata={'message_count': len(messages), 'channel_id': channel_id}
            )
            
        except Exception as e:
            logger.error(f"Error reading Slack channel {channel}: {e}")
            return ContextSource(
                source_type='slack',
                source_name=channel,
                content=f"[Error reading channel: {e}]",
                metadata={'error': str(e)}
            )


class FileReader:
    """Read files from local directories"""
    
    SUPPORTED_EXTENSIONS = {'.txt', '.md', '.json', '.csv', '.log', '.py', '.yaml', '.yml'}
    
    def read_folder(self, folder_path: str, recursive: bool = True) -> List[ContextSource]:
        """Read all supported files from a folder"""
        sources = []
        folder = Path(folder_path)
        
        if not folder.exists():
            logger.warning(f"Folder does not exist: {folder_path}")
            return sources
        
        pattern = '**/*' if recursive else '*'
        
        for file_path in folder.glob(pattern):
            if file_path.is_file() and file_path.suffix.lower() in self.SUPPORTED_EXTENSIONS:
                try:
                    content = file_path.read_text(encoding='utf-8', errors='ignore')
                    sources.append(ContextSource(
                        source_type='file',
                        source_name=str(file_path),
                        content=content[:10000],  # Limit content size
                        metadata={
                            'file_size': file_path.stat().st_size,
                            'extension': file_path.suffix
                        }
                    ))
                    logger.info(f"Read file: {file_path}")
                except Exception as e:
                    logger.error(f"Error reading file {file_path}: {e}")
        
        return sources
    
    def read_file(self, file_path: str) -> ContextSource:
        """Read a single file"""
        path = Path(file_path)
        
        if not path.exists():
            return ContextSource(
                source_type='upload',
                source_name=file_path,
                content=f"[File not found: {file_path}]",
                metadata={'error': 'File not found'}
            )
        
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            return ContextSource(
                source_type='upload',
                source_name=file_path,
                content=content[:10000],
                metadata={'file_size': path.stat().st_size}
            )
        except Exception as e:
            return ContextSource(
                source_type='upload',
                source_name=file_path,
                content=f"[Error reading file: {e}]",
                metadata={'error': str(e)}
            )


class NextStepsGenerator:
    """Generate next steps using Claude AI"""
    
    def __init__(self, use_bedrock: bool = True):
        self.use_bedrock = use_bedrock
        self._bedrock_client = None
        self._anthropic_client = None
    
    @property
    def bedrock_client(self):
        if self._bedrock_client is None and self.use_bedrock:
            try:
                import boto3
                self._bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
            except Exception as e:
                logger.warning(f"Bedrock client not available: {e}")
        return self._bedrock_client
    
    @property
    def anthropic_client(self):
        if self._anthropic_client is None and not self.use_bedrock:
            try:
                import anthropic
                self._anthropic_client = anthropic.Anthropic()
            except Exception as e:
                logger.warning(f"Anthropic client not available: {e}")
        return self._anthropic_client
    
    def generate(self, context_sources: List[ContextSource], prompt: str, opportunity_data: Dict = None) -> str:
        """Generate next steps based on gathered context"""
        
        # Build context string
        context_parts = []
        for source in context_sources:
            context_parts.append(f"### Source: {source.source_name} ({source.source_type})\n{source.content}\n")
        
        context_text = "\n".join(context_parts)
        
        # Add opportunity data if available
        opp_context = ""
        if opportunity_data:
            opp_context = f"""
### Current Opportunity Data
- Customer: {opportunity_data.get('Customer', {}).get('Account', {}).get('CompanyName', 'Unknown')}
- Stage: {opportunity_data.get('LifeCycle', {}).get('Stage', 'Unknown')}
- Current Next Steps: {opportunity_data.get('LifeCycle', {}).get('NextSteps', 'None')}
"""
        
        full_prompt = f"""You are an AI assistant helping a partner sales team manage AWS Partner Central opportunities.

Based on the following context from various sources, generate clear, actionable next steps for this opportunity.

{opp_context}

## Context from Sources:
{context_text}

## User Request:
{prompt}

## Instructions:
1. Analyze all the context provided
2. Identify the TOP 2-3 most critical action items
3. CRITICAL: Total response must be UNDER 255 characters (Partner Central field limit)
4. Be extremely concise - use abbreviations if needed
5. Format as a simple numbered list without headers

## Next Steps:"""

        try:
            if self.use_bedrock and self.bedrock_client:
                response = self.bedrock_client.invoke_model(
                    modelId='us.anthropic.claude-haiku-4-5-20251001-v1:0',
                    body=json.dumps({
                        "anthropic_version": "bedrock-2023-05-31",
                        "max_tokens": 1000,
                        "messages": [{"role": "user", "content": full_prompt}]
                    })
                )
                response_body = json.loads(response['body'].read())
                return response_body['content'][0]['text'].strip()
                
            elif self.anthropic_client:
                response = self.anthropic_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1000,
                    messages=[{"role": "user", "content": full_prompt}]
                )
                return response.content[0].text.strip()
            
            else:
                logger.error("No AI client available")
                return "[Error: No AI client configured. Set up AWS Bedrock or ANTHROPIC_API_KEY]"
                
        except Exception as e:
            logger.error(f"Error generating next steps: {e}")
            return f"[Error generating next steps: {e}]"


class PartnerCentralMCPClient:
    """Client for Partner Central MCP to update opportunities"""
    
    def __init__(self, config_path: str = None):
        self.config = self._load_config(config_path)
        self._pc_client = None
    
    def _load_config(self, config_path: str = None) -> Dict:
        """Load configuration"""
        if config_path and Path(config_path).exists():
            with open(config_path) as f:
                return json.load(f)
        
        # Try same directory config first
        local_config = Path(__file__).parent / 'config.json'
        if local_config.exists():
            with open(local_config) as f:
                return json.load(f)
        
        # Try parent directory config
        parent_config = Path(__file__).parent.parent / 'config.json'
        if parent_config.exists():
            with open(parent_config) as f:
                return json.load(f)
        
        return {
            "catalog": "AWS",
            "region": "us-east-1",
            "endpoints": {
                "partnercentral_selling": "https://partnercentral-selling.us-east-1.api.aws",
                "partnercentral_mcp": "https://partnercentral-agents.us-east-1.api.aws/mcp"
            }
        }
    
    @property
    def pc_client(self):
        """Get Partner Central selling client"""
        if self._pc_client is None:
            import boto3
            self._pc_client = boto3.client(
                'partnercentral-selling',
                region_name=self.config.get('region', 'us-east-1')
            )
        return self._pc_client
    
    def get_opportunity(self, opportunity_id: str) -> Dict:
        """Fetch opportunity data"""
        try:
            response = self.pc_client.get_opportunity(
                Catalog=self.config.get('catalog', 'AWS'),
                Identifier=opportunity_id
            )
            return response
        except Exception as e:
            logger.error(f"Error fetching opportunity {opportunity_id}: {e}")
            return {}
    
    def update_next_steps(self, opportunity_id: str, next_steps: str, interactive: bool = True) -> Dict:
        """Update opportunity's NextSteps field via MCP"""
        import boto3
        import requests
        from botocore.auth import SigV4Auth
        from botocore.awsrequest import AWSRequest
        
        # Prepare MCP request to update next steps
        mcp_endpoint = self.config['endpoints']['partnercentral_mcp']
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "sendMessage",
                "arguments": {
                    "content": [{
                        "type": "text",
                        "text": f"""Update opportunity {opportunity_id} with the following next steps:

{next_steps}

Please update the LifeCycle.NextSteps field with this content."""
                    }],
                    "catalog": self.config.get('catalog', 'AWS'),
                    "stream": False
                }
            }
        }
        
        # Sign request
        session = boto3.Session()
        credentials = session.get_credentials()
        
        request = AWSRequest(
            method='POST',
            url=mcp_endpoint,
            data=json.dumps(payload),
            headers={'Content-Type': 'application/json'}
        )
        
        # Determine service name based on endpoint (gamma vs production)
        service_name = 'partnercentral-agents' if 'gamma' in mcp_endpoint else 'partnercentral-agents-mcp'
        
        SigV4Auth(credentials, service_name, self.config.get('region', 'us-east-1')).add_auth(request)
        
        try:
            response = requests.post(
                request.url,
                data=request.body,
                headers=dict(request.headers),
                timeout=120
            )
            response.raise_for_status()
            result = response.json()
            
            # Check if approval is required
            if interactive:
                result = self._handle_approval_flow(result, credentials, service_name)
            
            return result
        except Exception as e:
            logger.error(f"Error updating opportunity via MCP: {e}")
            return {"error": str(e)}
    
    def _handle_approval_flow(self, mcp_response: Dict, credentials, service_name: str) -> Dict:
        """Handle interactive approval flow"""
        import requests
        from botocore.auth import SigV4Auth
        from botocore.awsrequest import AWSRequest
        
        try:
            content = mcp_response.get('result', {}).get('content', [])
            if not content or content[0].get('type') != 'text':
                return mcp_response
            
            inner = json.loads(content[0].get('text', '{}'))
            status = inner.get('status', '')
            session_id = inner.get('sessionId', '')
            
            if status != 'requires_approval':
                return mcp_response
            
            # Find tool approval request
            tool_use_id = None
            tool_name = None
            tool_input = None
            
            for item in inner.get('content', []):
                if item.get('type') == 'tool_approval_request':
                    tool_content = item.get('content', {})
                    # Parse the text field which contains JSON
                    try:
                        approval_data = json.loads(tool_content.get('text', '{}'))
                        tool_use_id = approval_data.get('tool_use_id')
                        tool_name = approval_data.get('tool_name')
                        tool_input = approval_data.get('input')
                    except:
                        tool_use_id = tool_content.get('toolUseId')
                        tool_name = tool_content.get('name')
                        tool_input = tool_content.get('input')
                    break
            
            if not tool_use_id:
                logger.warning("No tool approval request found in response")
                return mcp_response
            
            # Display approval prompt
            print("\n" + "="*60)
            print("🔐 APPROVAL REQUIRED")
            print("="*60)
            print(f"Tool: {tool_name}")
            print(f"Session: {session_id}")
            if tool_input:
                try:
                    input_data = json.loads(tool_input) if isinstance(tool_input, str) else tool_input
                    print(f"Action: Update NextSteps field")
                    if 'NextSteps' in str(input_data):
                        print(f"Content preview: {str(input_data)[:200]}...")
                except:
                    print(f"Input: {str(tool_input)[:200]}...")
            print("="*60)
            
            # Get user input
            while True:
                choice = input("\nApprove this update? [y/n]: ").strip().lower()
                if choice in ['y', 'yes']:
                    decision = 'approve'
                    break
                elif choice in ['n', 'no']:
                    decision = 'reject'
                    break
                print("Please enter 'y' or 'n'")
            
            # Send approval response
            mcp_endpoint = self.config['endpoints']['partnercentral_mcp']
            
            approval_payload = {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "sendMessage",
                    "arguments": {
                        "content": [{
                            "type": "tool_approval_response",
                            "toolUseId": tool_use_id,
                            "decision": decision
                        }],
                        "catalog": self.config.get('catalog', 'AWS'),
                        "sessionId": session_id,
                        "stream": False
                    }
                }
            }
            
            request = AWSRequest(
                method='POST',
                url=mcp_endpoint,
                data=json.dumps(approval_payload),
                headers={'Content-Type': 'application/json'}
            )
            
            SigV4Auth(credentials, service_name, self.config.get('region', 'us-east-1')).add_auth(request)
            
            logger.info(f"Sending {decision} decision...")
            response = requests.post(
                request.url,
                data=request.body,
                headers=dict(request.headers),
                timeout=120
            )
            response.raise_for_status()
            
            final_result = response.json()
            
            # Parse final status
            try:
                final_content = final_result.get('result', {}).get('content', [])
                if final_content and final_content[0].get('type') == 'text':
                    final_inner = json.loads(final_content[0].get('text', '{}'))
                    final_status = final_inner.get('status', '')
                    
                    # Check for errors in tool results
                    update_error = None
                    for item in final_inner.get('content', []):
                        if item.get('type') == 'serverToolResult':
                            output = item.get('content', {}).get('output', '')
                            try:
                                output_data = json.loads(output)
                                update_resp = output_data.get('UpdateOpportunity', {}).get('response', {})
                                if 'error' in update_resp:
                                    error_info = update_resp['error']
                                    update_error = error_info.get('message', str(error_info))
                            except:
                                if 'error' in output.lower():
                                    update_error = output
                    
                    if update_error:
                        print("\n" + "="*60)
                        print("❌ UPDATE FAILED")
                        print("="*60)
                        print(f"Error: {update_error}")
                        print("="*60)
                    elif final_status == 'complete' and not update_error:
                        print("\n✅ Update approved and completed!")
                    elif decision == 'reject':
                        print("\n❌ Update rejected by user.")
            except Exception as parse_err:
                logger.warning(f"Could not parse final status: {parse_err}")
            
            return final_result
            
        except Exception as e:
            logger.error(f"Error in approval flow: {e}")
            return mcp_response


class OrchestratorAgent:
    """Main orchestrator that coordinates all components"""
    
    def __init__(self, config_path: str = None):
        self.slack_reader = SlackReader()
        self.file_reader = FileReader()
        self.next_steps_generator = NextStepsGenerator()
        self.mcp_client = PartnerCentralMCPClient(config_path)
    
    def gather_context(
        self,
        slack_channels: List[str] = None,
        local_folders: List[str] = None,
        uploaded_files: List[str] = None
    ) -> List[ContextSource]:
        """Gather context from all specified sources"""
        sources = []
        
        # Read from Slack channels
        if slack_channels:
            for channel in slack_channels:
                logger.info(f"Reading Slack channel: {channel}")
                source = self.slack_reader.read_channel(channel)
                sources.append(source)
        
        # Read from local folders
        if local_folders:
            for folder in local_folders:
                logger.info(f"Reading local folder: {folder}")
                folder_sources = self.file_reader.read_folder(folder)
                sources.extend(folder_sources)
        
        # Read uploaded files
        if uploaded_files:
            for file_path in uploaded_files:
                logger.info(f"Reading uploaded file: {file_path}")
                source = self.file_reader.read_file(file_path)
                sources.append(source)
        
        logger.info(f"Gathered {len(sources)} context sources")
        return sources
    
    def run(
        self,
        opportunity_id: str,
        prompt: str,
        slack_channels: List[str] = None,
        local_folders: List[str] = None,
        uploaded_files: List[str] = None,
        update_opportunity: bool = True
    ) -> AgentResult:
        """
        Run the full agent workflow:
        1. Gather context from sources
        2. Fetch current opportunity data
        3. Generate next steps using AI
        4. Update opportunity via MCP
        """
        try:
            logger.info(f"Starting orchestrator for opportunity: {opportunity_id}")
            
            # Step 1: Gather context
            context_sources = self.gather_context(
                slack_channels=slack_channels,
                local_folders=local_folders,
                uploaded_files=uploaded_files
            )
            
            if not context_sources:
                return AgentResult(
                    success=False,
                    next_steps="",
                    context_sources=[],
                    error="No context sources provided"
                )
            
            # Step 2: Fetch opportunity data
            logger.info(f"Fetching opportunity data: {opportunity_id}")
            opportunity_data = self.mcp_client.get_opportunity(opportunity_id)
            
            # Step 3: Generate next steps
            logger.info("Generating next steps with AI...")
            next_steps = self.next_steps_generator.generate(
                context_sources=context_sources,
                prompt=prompt,
                opportunity_data=opportunity_data
            )
            
            logger.info(f"Generated next steps:\n{next_steps}")
            
            # Step 4: Update opportunity via MCP
            mcp_response = None
            if update_opportunity:
                logger.info(f"Updating opportunity {opportunity_id} via MCP...")
                mcp_response = self.mcp_client.update_next_steps(opportunity_id, next_steps)
                
                if "error" in mcp_response:
                    logger.warning(f"MCP update warning: {mcp_response['error']}")
                else:
                    logger.info("Opportunity updated successfully")
            
            return AgentResult(
                success=True,
                next_steps=next_steps,
                context_sources=context_sources,
                mcp_response=mcp_response
            )
            
        except Exception as e:
            logger.error(f"Orchestrator error: {e}")
            return AgentResult(
                success=False,
                next_steps="",
                context_sources=[],
                error=str(e)
            )


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(description='Agent-to-Agent Next Steps Generator')
    parser.add_argument('--opportunity-id', '-o', required=True, help='Partner Central Opportunity ID')
    parser.add_argument('--prompt', '-p', default='Generate next steps based on the context', help='Prompt for AI')
    parser.add_argument('--slack-channel', '-s', action='append', help='Slack channel(s) to read')
    parser.add_argument('--local-folder', '-f', action='append', help='Local folder(s) to scan')
    parser.add_argument('--upload', '-u', action='append', help='File(s) to upload as context')
    parser.add_argument('--dry-run', action='store_true', help='Generate but do not update opportunity')
    parser.add_argument('--config', '-c', help='Path to config.json')
    
    args = parser.parse_args()
    
    agent = OrchestratorAgent(config_path=args.config)
    
    result = agent.run(
        opportunity_id=args.opportunity_id,
        prompt=args.prompt,
        slack_channels=args.slack_channel,
        local_folders=args.local_folder,
        uploaded_files=args.upload,
        update_opportunity=not args.dry_run
    )
    
    print("\n" + "="*60)
    print("ORCHESTRATOR AGENT RESULT")
    print("="*60)
    print(f"Success: {result.success}")
    print(f"Context Sources: {len(result.context_sources)}")
    print(f"\nGenerated Next Steps:\n{result.next_steps}")
    
    if result.mcp_response:
        # Parse MCP response to extract status
        try:
            content = result.mcp_response.get('result', {}).get('content', [])
            if content and content[0].get('type') == 'text':
                inner = json.loads(content[0].get('text', '{}'))
                status = inner.get('status', 'unknown')
                print(f"\nMCP Status: {status}")
                if status == 'requires_approval':
                    print("⏳ Partner Central Agent is waiting for human approval to update the opportunity.")
                elif status == 'complete':
                    print("✅ Opportunity update completed.")
        except:
            pass
        
        if 'error' in result.mcp_response:
            print(f"\nMCP Error: {result.mcp_response['error']}")
    
    if result.error:
        print(f"\nError: {result.error}")
    
    return 0 if result.success else 1


if __name__ == "__main__":
    exit(main())
