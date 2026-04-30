# Partner Central Agent Chat

## Overview

The Agent Chat feature provides a conversational interface to the Partner Central Selling API. Instead of navigating individual API screens, you can ask natural language questions and have an AI agent query and update your opportunities on your behalf.

## Architecture

```
Browser (React App)
       │
       │  SigV4-signed JSON-RPC 2.0 (HTTPS POST)
       ▼
Partner Central Agent MCP Server
https://partnercentral-agents-mcp.us-east-1.api.aws/mcp
       │
       │  internally invokes
       ▼
  AWS Bedrock Agent
  (Partner Central tools registered as agent actions)
       │
       │  calls
       ▼
Partner Central Selling API
(ListOpportunities, GetOpportunity, UpdateOpportunity, ...)
```

### Layers explained

**MCP Server** — AWS hosts a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes two tools:
- `sendMessage` — sends a natural language message; the server routes it to the Bedrock agent and returns the response
- `tool_approval_response` (sent via `sendMessage` with content type `tool_approval_response`) — used to approve, reject, or override a pending write operation

**Bedrock Agent** — managed by AWS inside the `partnercentral-agents-mcp` service. It receives your message, decides which Partner Central API calls to make, and orchestrates multi-step workflows (e.g., listing opportunities, fetching details, summarising). You never call Bedrock directly.

**Human-in-the-loop (approval cards)** — before executing any write operation (create, update, associate, etc.), the agent pauses and returns a `requires_approval` response. The UI surfaces this as an approval card. You can:
- **Approve** — execute the operation as proposed
- **Reject** — cancel the operation (with optional reason)
- **Override** — provide modified instructions; the agent re-plans before proceeding

**SigV4 signing** — the MCP endpoint is a standard AWS service endpoint. Every request must be signed with your AWS credentials (the same access key / secret key / session token you log in with). Signing is done in-browser using `@aws-sdk/signature-v4` and `@aws-crypto/sha256-browser`.

**Session continuity** — the server returns a `sessionId` on the first response. Subsequent messages include that `sessionId` so the agent retains full conversation context across turns.

## Transport protocol

All communication uses **JSON-RPC 2.0** over a single HTTPS endpoint (`POST /mcp`).

### Sending a message

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "sendMessage",
    "arguments": {
      "catalog": "Sandbox",
      "content": [{ "type": "text", "text": "List my open opportunities" }]
    }
  }
}
```

On subsequent turns, include the `sessionId` returned by the server:

```json
{
  "arguments": {
    "catalog": "Sandbox",
    "sessionId": "<session-id-from-previous-response>",
    "content": [{ "type": "text", "text": "Tell me more about the first one" }]
  }
}
```

### Responding to an approval request

When the server returns `status: "requires_approval"`, send:

```json
{
  "arguments": {
    "catalog": "Sandbox",
    "sessionId": "<session-id>",
    "content": [{
      "type": "tool_approval_response",
      "toolUseId": "<id-from-approval-request>",
      "decision": "approve"
    }]
  }
}
```

`decision` can be `"approve"`, `"reject"`, or `"override"`. For `"reject"` and `"override"`, include an optional `"message"` field.

### Server response shape

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"sessionId\": \"...\", \"status\": \"COMPLETED\", \"content\": [{\"type\": \"ASSISTANT_RESPONSE\", \"content\": {\"text\": \"Here are your opportunities...\"}}]}"
    }]
  }
}
```

For approval requests, the inner payload contains a `tool_approval_request` content block alongside a human-readable text/`ASSISTANT_RESPONSE` block:

```json
{
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"sessionId\":\"...\",\"status\":\"requires_approval\",\"content\":[{\"type\":\"text\",\"text\":\"I'd like to update opportunity O1234567890 ...\"},{\"type\":\"tool_approval_request\",\"toolUseId\":\"tooluse_abc123\",\"toolName\":\"update_opportunity_enhanced\",\"parameters\":{...}}]}"
    }]
  }
}
```

`parseAgentResponse` walks each inner content block by type, pulls `toolUseId` / `toolName` / `parameters` out of the `tool_approval_request` block, and collects the description from `text` / `ASSISTANT_RESPONSE` blocks. If `toolUseId` is missing it throws immediately rather than sending a bad approval.

## Key source files

| File | Purpose |
|------|---------|
| `src/services/mcpService.js` | All MCP communication: SigV4 signing, `sendMessage`, `sendApproval`, `parseAgentResponse`, `getCallerIdentity` |
| `src/components/AgentChat.js` | Chat UI: `MessageBubble`, `ApprovalCard`, session management, input handling |

## Prerequisites

The AWS credentials used to log in must have an IAM policy that grants access to the MCP endpoint. The service name for IAM and SigV4 is `partnercentral-agents-mcp`.

Example IAM statement:

```json
{
  "Effect": "Allow",
  "Action": "partnercentral-agents-mcp:*",
  "Resource": "*"
}
```

## Example queries

```
List my open opportunities
Tell me about opportunity O1234567890
Which of my opportunities are in the Launched stage?
Update the close date of O1234567890 to December 31 2025
Submit opportunity O1234567890 for AWS review
```

## Catalog selection

The catalog (`Sandbox` or `AWS`) is read from the credentials stored at login and passed in every `sendMessage` call. Switching catalog requires logging out and back in with the desired catalog selected.
