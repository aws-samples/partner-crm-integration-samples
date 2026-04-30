#!/usr/bin/env python
"""
Setup Verification Script

Run this script to verify all prerequisites are correctly configured:
1. AWS credentials
2. Bedrock model access
3. Partner Central API access
4. Partner Central MCP server access

Usage:
    python verify_setup.py
    python verify_setup.py --catalog Sandbox
    python verify_setup.py --catalog AWS
"""

import json
import sys
import argparse
from pathlib import Path


def print_status(name: str, success: bool, message: str = ""):
    """Print a status line with emoji indicator"""
    icon = "✅" if success else "❌"
    status = "PASS" if success else "FAIL"
    print(f"{icon} [{status}] {name}")
    if message:
        print(f"   └─ {message}")


def print_section(title: str):
    """Print a section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def check_aws_credentials():
    """Verify AWS credentials are configured"""
    print_section("1. AWS Credentials")
    
    try:
        import boto3
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        
        print_status("AWS credentials configured", True)
        print(f"   └─ Account: {identity['Account']}")
        print(f"   └─ ARN: {identity['Arn']}")
        return True
        
    except Exception as e:
        print_status("AWS credentials configured", False, str(e))
        print("\n   Fix: Run 'aws configure' or set AWS_PROFILE environment variable")
        return False


def check_bedrock_model_access():
    """Verify Bedrock model access"""
    print_section("2. Amazon Bedrock Model Access")
    
    try:
        import boto3
        
        # Test with converse API (more reliable than invoke_model)
        bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
        
        # Try the recommended model
        model_id = "us.anthropic.claude-haiku-4-5-20251001-v1:0"
        
        response = bedrock.converse(
            modelId=model_id,
            messages=[{
                "role": "user",
                "content": [{"text": "Say 'Bedrock access verified' in exactly those words."}]
            }],
            inferenceConfig={"maxTokens": 50}
        )
        
        output = response['output']['message']['content'][0]['text']
        print_status(f"Bedrock model access ({model_id})", True)
        print(f"   └─ Response: {output[:50]}...")
        return True
        
    except bedrock.exceptions.AccessDeniedException as e:
        print_status("Bedrock model access", False, "Access denied")
        print("\n   Fix: Enable model access in Bedrock console (us-east-1)")
        print("   1. Go to Amazon Bedrock console")
        print("   2. Select 'Model access' in left menu")
        print("   3. Enable Claude models")
        return False
        
    except Exception as e:
        error_msg = str(e)
        if "Could not resolve" in error_msg or "EndpointConnectionError" in error_msg:
            print_status("Bedrock model access", False, "Network/endpoint error")
        else:
            print_status("Bedrock model access", False, error_msg[:100])
        return False


def check_partner_central_api(catalog: str):
    """Verify Partner Central Selling API access"""
    print_section("3. Partner Central Selling API")
    
    try:
        import boto3
        import requests
        from botocore.auth import SigV4Auth
        from botocore.awsrequest import AWSRequest
        
        # Use direct HTTP request with SigV4 signing since partnercentral-selling
        # is not a standard boto3 service
        endpoint = f"https://partnercentral-selling.us-east-1.api.aws/ListOpportunities"
        
        payload = {
            "Catalog": catalog,
            "MaxResults": 1
        }
        
        session = boto3.Session()
        credentials = session.get_credentials()
        
        request = AWSRequest(
            method='POST',
            url=endpoint,
            data=json.dumps(payload),
            headers={
                'Content-Type': 'application/x-amz-json-1.0',
                'X-Amz-Target': 'AWSPartnerCentralSelling.ListOpportunities'
            }
        )
        
        SigV4Auth(credentials, 'partnercentral-selling', 'us-east-1').add_auth(request)
        
        response = requests.post(
            request.url,
            data=request.body,
            headers=dict(request.headers),
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            count = len(result.get('OpportunitySummaries', []))
            print_status(f"Partner Central API ({catalog} catalog)", True)
            print(f"   └─ Found {count} opportunity(ies) in response")
            return True
        else:
            error_msg = response.text[:100]
            print_status(f"Partner Central API ({catalog} catalog)", False, f"HTTP {response.status_code}")
            print(f"   └─ {error_msg}")
            return False
        
    except Exception as e:
        error_msg = str(e)
        print_status(f"Partner Central API ({catalog} catalog)", False, error_msg[:100])
        
        if "AccessDeniedException" in error_msg:
            print("\n   Fix: Attach 'AWSMcpServiceActionsFullAccess' managed policy")
        elif "not registered" in error_msg.lower() or "partner" in error_msg.lower():
            print(f"\n   Fix: Register as a partner in the {catalog} catalog first")
            print("   See README.md for CreatePartner API instructions")
        return False


def check_partner_central_mcp(catalog: str):
    """Verify Partner Central MCP server access"""
    print_section("4. Partner Central MCP Server")
    
    try:
        import boto3
        import requests
        from botocore.auth import SigV4Auth
        from botocore.awsrequest import AWSRequest
        
        mcp_endpoint = "https://partnercentral-agents.us-east-1.api.aws/mcp"
        
        # Simple test: send a hello message
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "sendMessage",
                "arguments": {
                    "content": [{
                        "type": "text",
                        "text": "Hello, what can you help me with?"
                    }],
                    "catalog": catalog,
                    "stream": False
                }
            }
        }
        
        # Sign request with SigV4
        session = boto3.Session()
        credentials = session.get_credentials()
        
        request = AWSRequest(
            method='POST',
            url=mcp_endpoint,
            data=json.dumps(payload),
            headers={'Content-Type': 'application/json'}
        )
        
        SigV4Auth(credentials, 'partnercentral-agents-mcp', 'us-east-1').add_auth(request)
        
        response = requests.post(
            request.url,
            data=request.body,
            headers=dict(request.headers),
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Check for error in response
            if 'error' in result:
                error = result['error']
                print_status("Partner Central MCP", False, f"Error: {error.get('message', error)}")
                return False
            
            # Parse the response to show agent capabilities
            try:
                content = result.get('result', {}).get('content', [])
                if content and content[0].get('type') == 'text':
                    inner = json.loads(content[0].get('text', '{}'))
                    status = inner.get('status', 'unknown')
                    
                    # Extract assistant response
                    for item in inner.get('content', []):
                        if item.get('type') == 'ASSISTANT_RESPONSE':
                            text = item.get('content', {}).get('text', '')
                            print_status("Partner Central MCP", True)
                            print(f"   └─ Status: {status}")
                            print(f"   └─ Agent: {text[:80]}...")
                            return True
                    
                    print_status("Partner Central MCP", True, f"Status: {status}")
                    return True
            except:
                pass
            
            print_status("Partner Central MCP", True, "Connected successfully")
            return True
        else:
            print_status("Partner Central MCP", False, f"HTTP {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print_status("Partner Central MCP", False, "Request timed out (60s)")
        print("\n   Note: First request may take longer. Try again.")
        return False
        
    except Exception as e:
        error_msg = str(e)
        print_status("Partner Central MCP", False, error_msg[:100])
        
        if "AccessDeniedException" in error_msg or "403" in error_msg:
            print("\n   Fix: Ensure IAM policy includes partnercentral:UseSession")
        return False


def check_config_file():
    """Check if config.json exists and is valid"""
    print_section("5. Configuration File")
    
    config_path = Path(__file__).parent / 'config.json'
    
    if not config_path.exists():
        print_status("config.json exists", False, "File not found")
        print("\n   Fix: Create config.json with catalog and endpoint settings")
        return False, None
    
    try:
        with open(config_path) as f:
            config = json.load(f)
        
        required_keys = ['catalog', 'region', 'endpoints']
        missing = [k for k in required_keys if k not in config]
        
        if missing:
            print_status("config.json valid", False, f"Missing keys: {missing}")
            return False, None
        
        print_status("config.json exists and valid", True)
        print(f"   └─ Catalog: {config.get('catalog')}")
        print(f"   └─ Region: {config.get('region')}")
        return True, config
        
    except json.JSONDecodeError as e:
        print_status("config.json valid", False, f"Invalid JSON: {e}")
        return False, None


def main():
    parser = argparse.ArgumentParser(description='Verify Agent-to-Agent setup')
    parser.add_argument('--catalog', '-c', default=None, 
                        help='Catalog to test (Sandbox or AWS). Defaults to config.json value.')
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("  Agent-to-Agent Setup Verification")
    print("="*60)
    
    results = []
    
    # Check config file first
    config_ok, config = check_config_file()
    results.append(config_ok)
    
    # Determine catalog to use
    catalog = args.catalog
    if not catalog:
        catalog = config.get('catalog', 'Sandbox') if config else 'Sandbox'
    
    print(f"\n   Using catalog: {catalog}")
    
    # Run all checks
    results.append(check_aws_credentials())
    results.append(check_bedrock_model_access())
    results.append(check_partner_central_api(catalog))
    results.append(check_partner_central_mcp(catalog))
    
    # Summary
    print_section("Summary")
    
    passed = sum(results)
    total = len(results)
    
    if all(results):
        print("🎉 All checks passed! Your setup is ready.")
        print("\nNext steps:")
        print("  1. Run the demo: python server.py")
        print("  2. Or use CLI: python orchestrator_agent.py --help")
        return 0
    else:
        print(f"⚠️  {passed}/{total} checks passed. Please fix the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
