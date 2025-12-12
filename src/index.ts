#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const MCP_ENDPOINT = "https://learn.microsoft.com/api/mcp";
const TOOL_NAME = "microsoft_docs_search";
const DEBUG = process.env.DEBUG === "true";

async function validateEndpoint(): Promise<boolean> {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Accept 2xx responses and 400 (which indicates the endpoint exists but request format may be incorrect)
    return response.ok || response.status === 400;
  } catch (error) {
    return false;
  }
}

async function validateTool(client: Client): Promise<boolean> {
  try {
    const tools = await client.listTools();
    return tools.tools.some((tool: Tool) => tool.name === TOOL_NAME);
  } catch (error) {
    return false;
  }
}

async function searchDocs(query: string): Promise<void> {
  console.log(`[INFO] Starting search with query: "${query}"`);
  
  // Validate endpoint
  console.log(`[INFO] Validating MCP endpoint: ${MCP_ENDPOINT}`);
  const endpointAvailable = await validateEndpoint();
  if (!endpointAvailable) {
    console.error(`[ERROR] MCP endpoint ${MCP_ENDPOINT} is not available`);
    process.exit(1);
  }
  console.log(`[INFO] MCP endpoint is available`);

  // Create MCP client
  console.log(`[INFO] Creating MCP client...`);
  const transport = new StreamableHTTPClientTransport(new URL(MCP_ENDPOINT));
  const client = new Client(
    {
      name: "learncli",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    console.log(`[INFO] Connecting to MCP server...`);
    await client.connect(transport);
    console.log(`[INFO] Connected to MCP server`);

    // Validate tool
    console.log(`[INFO] Validating tool '${TOOL_NAME}'...`);
    const toolAvailable = await validateTool(client);
    if (!toolAvailable) {
      console.error(`[ERROR] Tool '${TOOL_NAME}' is not available on the MCP server`);
      await client.close();
      process.exit(1);
    }
    console.log(`[INFO] Tool '${TOOL_NAME}' is available`);

    // Call the tool
    console.log(`[INFO] Calling tool '${TOOL_NAME}' with query: "${query}"`);
    const result = await client.callTool({
      name: TOOL_NAME,
      arguments: {
        query,
      },
    });

    console.log(`[INFO] Received response from MCP server`);
    // Output raw response
    console.log(`[RESPONSE] Raw response from MCP server:`);
    console.log(JSON.stringify(result, null, 2));

    await client.close();
    console.log(`[INFO] Connection closed`);
  } catch (error) {
    console.error("[ERROR] Error searching docs:", error instanceof Error ? error.message : String(error));
    try {
      await client.close();
    } catch (closeError) {
      // Ignore errors during cleanup
    }
    process.exit(1);
  }
}

async function main() {
  const args: string[] = process.argv.slice(2);
  if (DEBUG) console.log(`[DEBUG] Received arguments:`, args);
  const firstParam: string | undefined = args[0];

  if (firstParam === "docs") {
    // Check for -q flag
    const qIndex = args.indexOf("-q");
    if (qIndex !== -1 && args[qIndex + 1]) {
      const query = args[qIndex + 1];
      if (DEBUG) console.log(`[DEBUG] Found query at index ${qIndex + 1}: "${query}"`);
      await searchDocs(query);
    } else {
      console.log("hello docs");
      if (DEBUG) console.log(`[DEBUG] No query found. Expected: docs -q "your query"`);
    }
  } else if (firstParam === "code") {
    console.log("hello code");
  } else {
    console.log("Please provide a first parameter: 'docs' or 'code'");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
