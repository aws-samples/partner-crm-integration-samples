#!/usr/bin/env python
"""
Agent-to-Agent API Server

Exposes the orchestrator agent as a REST API.
"""

import os
import json
import logging
import tempfile
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from orchestrator_agent import OrchestratorAgent, AgentResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Agent-to-Agent API",
    description="Orchestrator agent that generates next steps from multiple sources and updates Partner Central",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent
agent = OrchestratorAgent()


class GenerateRequest(BaseModel):
    """Request to generate next steps"""
    opportunity_id: str
    prompt: str = "Generate next steps based on the provided context"
    slack_channels: Optional[List[str]] = None
    local_folders: Optional[List[str]] = None
    update_opportunity: bool = True


class GenerateResponse(BaseModel):
    """Response from generate endpoint"""
    success: bool
    next_steps: str
    source_count: int
    mcp_response: Optional[dict] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "Agent-to-Agent API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_next_steps(request: GenerateRequest):
    """
    Generate next steps from context sources and optionally update opportunity.
    
    - **opportunity_id**: Partner Central opportunity ID (e.g., O15081741)
    - **prompt**: Custom prompt for AI generation
    - **slack_channels**: List of Slack channels to read
    - **local_folders**: List of local folders to scan
    - **update_opportunity**: Whether to update the opportunity via MCP
    """
    try:
        result = agent.run(
            opportunity_id=request.opportunity_id,
            prompt=request.prompt,
            slack_channels=request.slack_channels,
            local_folders=request.local_folders,
            update_opportunity=request.update_opportunity
        )
        
        return GenerateResponse(
            success=result.success,
            next_steps=result.next_steps,
            source_count=len(result.context_sources),
            mcp_response=result.mcp_response,
            error=result.error
        )
        
    except Exception as e:
        logger.error(f"Error in generate endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-with-files", response_model=GenerateResponse)
async def generate_with_files(
    opportunity_id: str = Form(...),
    prompt: str = Form("Generate next steps based on the provided context"),
    slack_channels: Optional[str] = Form(None),
    update_opportunity: bool = Form(True),
    files: List[UploadFile] = File(default=[])
):
    """
    Generate next steps with uploaded files as context.
    
    - **opportunity_id**: Partner Central opportunity ID
    - **prompt**: Custom prompt for AI generation
    - **slack_channels**: Comma-separated list of Slack channels
    - **update_opportunity**: Whether to update the opportunity via MCP
    - **files**: Files to upload as context
    """
    try:
        # Save uploaded files to temp directory
        uploaded_paths = []
        temp_dir = tempfile.mkdtemp()
        
        for file in files:
            if file.filename:
                file_path = Path(temp_dir) / file.filename
                content = await file.read()
                file_path.write_bytes(content)
                uploaded_paths.append(str(file_path))
                logger.info(f"Saved uploaded file: {file_path}")
        
        # Parse slack channels
        channels = None
        if slack_channels:
            channels = [c.strip() for c in slack_channels.split(',')]
        
        # Run agent
        result = agent.run(
            opportunity_id=opportunity_id,
            prompt=prompt,
            slack_channels=channels,
            uploaded_files=uploaded_paths,
            update_opportunity=update_opportunity
        )
        
        # Cleanup temp files
        for path in uploaded_paths:
            try:
                os.remove(path)
            except:
                pass
        
        return GenerateResponse(
            success=result.success,
            next_steps=result.next_steps,
            source_count=len(result.context_sources),
            mcp_response=result.mcp_response,
            error=result.error
        )
        
    except Exception as e:
        logger.error(f"Error in generate-with-files endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/opportunity/{opportunity_id}")
async def get_opportunity(opportunity_id: str):
    """Fetch opportunity data from Partner Central"""
    try:
        data = agent.mcp_client.get_opportunity(opportunity_id)
        if not data:
            raise HTTPException(status_code=404, detail=f"Opportunity {opportunity_id} not found")
        
        return {
            "opportunity_id": opportunity_id,
            "customer": data.get('Customer', {}).get('Account', {}).get('CompanyName'),
            "stage": data.get('LifeCycle', {}).get('Stage'),
            "next_steps": data.get('LifeCycle', {}).get('NextSteps'),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching opportunity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
