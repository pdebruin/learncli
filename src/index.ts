#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_ENDPOINT = "https://learn.microsoft.com/api/mcp";
const TOOL_NAME = "microsoft_docs_search";

async function validateEndpoint(): Promise<boolean> {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok || response.status === 400; // 400 might indicate valid endpoint but bad request
  } catch (error) {
    return false;
  }
}

async function validateTool(client: Client): Promise<boolean> {
  try {
    const tools = await client.listTools();
    return tools.tools.some((tool) => tool.name === TOOL_NAME);
  } catch (error) {
    return false;
  }
}

async function searchDocs(query: string): Promise<void> {
  // Validate endpoint
  const endpointAvailable = await validateEndpoint();
  if (!endpointAvailable) {
    console.error(`Error: MCP endpoint ${MCP_ENDPOINT} is not available`);
    process.exit(1);
  }

  // Create MCP client
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
    await client.connect(transport);

    // Validate tool
    const toolAvailable = await validateTool(client);
    if (!toolAvailable) {
      console.error(`Error: Tool '${TOOL_NAME}' is not available on the MCP server`);
      await client.close();
      process.exit(1);
    }

    // Call the tool
    const result = await client.callTool({
      name: TOOL_NAME,
      arguments: {
        query: query,
      },
    });

    // Output raw response
    console.log(JSON.stringify(result, null, 2));

    await client.close();
  } catch (error) {
    console.error("Error searching docs:", error instanceof Error ? error.message : String(error));
    await client.close();
    process.exit(1);
  }
}

async function main() {
  const args: string[] = process.argv.slice(2);
  const firstParam: string | undefined = args[0];

  if (firstParam === "docs") {
    // Check for -q flag
    const qIndex = args.indexOf("-q");
    if (qIndex !== -1 && args[qIndex + 1]) {
      const query = args[qIndex + 1];
      await searchDocs(query);
    } else {
      console.log("hello docs");
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
