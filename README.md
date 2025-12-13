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

This will compile the TypeScript source code from the `src/` directory to JavaScript in the `dist/` directory.

### Usage

After building, you can run the CLI in several ways:

#### Using node directly

```bash
# Show help
node dist/index.js

# Search Microsoft Learn documentation
node dist/index.js docs -q "your search query"

# Example search
node dist/index.js docs -q "azure functions"

# Code command (placeholder)
node dist/index.js code
```

#### Using npm start

```bash
# Show help
npm start

# Search with a query (note the -- before arguments)
npm start -- docs -q "your search query"

# Example
npm start -- docs -q "azure functions"
```

**Note:** When using `npm start`, you must include `--` before the arguments to pass them correctly to the script.

#### Logging

The CLI provides execution progress logs when searching documentation:
- `[INFO]` logs show the execution flow (endpoint validation, MCP connection, tool calling, etc.)
- `[ERROR]` logs show any errors encountered
- `[RESULTS]` logs show the search results
- `[RESPONSE]` logs show the raw response from the MCP server

To enable detailed debug logging, set the `DEBUG` environment variable:

```bash
# On Linux/macOS
DEBUG=true node dist/index.js docs -q "your search query"

# On Windows (PowerShell)
$env:DEBUG="true"; node dist/index.js docs -q "your search query"

# On Windows (CMD)
set DEBUG=true && node dist/index.js docs -q "your search query"
```

### Development

For active development, you can use the watch mode to automatically recompile TypeScript files when they change:

```bash
# Start TypeScript compiler in watch mode
npm run dev
```

This will keep running and recompile your code whenever you save changes to `.ts` files. In a separate terminal, you can then run the compiled code:

```bash
# In another terminal
node dist/index.js docs -q "test query"
```

#### Available Scripts

- **`npm run build`** - Compiles TypeScript to JavaScript (one-time build)
- **`npm run dev`** - Compiles TypeScript in watch mode (auto-recompile on changes)
- **`npm start`** - Builds and runs the CLI
- **`npm test`** - Builds and runs tests (if available)

### Troubleshooting

#### Build fails with TypeScript errors

1. Make sure you have the correct Node.js version:
   ```bash
   node --version  # Should be 18.x or higher
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. Verify TypeScript is installed:
   ```bash
   npx tsc --version  # Should be 5.x or higher
   ```

#### Module not found errors

If you see errors like `Cannot find module '@modelcontextprotocol/sdk/...'`:

1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. Check that the `node_modules` directory exists and contains the required packages:
   ```bash
   ls node_modules/@modelcontextprotocol/sdk
   ```

#### Runtime errors

If the built application fails to run:

1. Make sure you've built the project first:
   ```bash
   npm run build
   ```

2. Verify the `dist/` directory exists and contains `index.js`:
   ```bash
   ls dist/
   ```

3. Try running with more verbose output:
   ```bash
   DEBUG=true node dist/index.js docs -q "test"
   ```