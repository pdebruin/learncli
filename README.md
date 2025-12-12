# learncli

A cross-platform command-line learning app that integrates with Microsoft Learn documentation via MCP (Model Context Protocol).

## Running from Source

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/pdebruin/learncli.git
cd learncli
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Usage

After building, you can run the CLI:

```bash
# Run the CLI
node dist/index.js

# Search Microsoft Learn documentation
node dist/index.js docs -q "your search query"

# Code command (placeholder)
node dist/index.js code
```

Or use the npm start script:

```bash
npm start -- docs -q "your search query"
```

**Note:** When using `npm start`, you must include `--` before the arguments to pass them correctly to the script.

#### Logging

The CLI provides execution progress logs when searching documentation:
- `[INFO]` logs show the execution flow (endpoint validation, MCP connection, tool calling, etc.)
- `[ERROR]` logs show any errors encountered
- `[RESPONSE]` logs show the raw response from the MCP server

To enable detailed debug logging, set the `DEBUG` environment variable:

```bash
DEBUG=true node dist/index.js docs -q "your search query"
```

### Development

- **Build**: `npm run build` - Compiles TypeScript to JavaScript
- **Start**: `npm start` - Builds and runs the CLI
- **Test**: `npm test` - Builds and runs tests (if available)