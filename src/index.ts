#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const MCP_ENDPOINT = "https://learn.microsoft.com/api/mcp";
const TOOL_NAME = "microsoft_docs_search";
const DEBUG = process.env.DEBUG === "true";

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
    
    // Parse and format the response
    if (result.content && Array.isArray(result.content)) {
      // Look for structured content (JSON arrays or objects)
      let structuredData = null;
      
      for (const item of result.content) {
        if (item.type === 'text' && item.text && typeof item.text === 'string') {
          const trimmed = item.text.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              const parsed = JSON.parse(trimmed);
              structuredData = parsed;
              break;
            } catch (e) {
              // Not valid JSON, continue searching
              if (DEBUG) console.log(`[DEBUG] Failed to parse JSON: ${e instanceof Error ? e.message : String(e)}`);
            }
          }
        }
      }
      
      if (structuredData) {
        // Handle both array and object structures
        let results = Array.isArray(structuredData) ? structuredData : [structuredData];
        
        console.log(`[RESULTS] Found ${results.length} result(s)`);
        
        if (results.length > 0) {
          const firstResult = results[0];
          console.log(`\n[FIRST RESULT]`);
          if (firstResult.title) console.log(`Title: ${firstResult.title}`);
          if (firstResult.body) console.log(`Body: ${firstResult.body}`);
          if (firstResult.link) console.log(`Link: ${firstResult.link}`);
        }
      } else {
        console.log(`[RESPONSE] No structured content found`);
        if (DEBUG) console.log(JSON.stringify(result, null, 2));
      }
    } else {
      console.log(`[RESPONSE] Unexpected response format`);
      if (DEBUG) console.log(JSON.stringify(result, null, 2));
    }

    await client.close();
    console.log(`\n[INFO] Connection closed`);
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
