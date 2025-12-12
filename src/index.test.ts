import { execFileSync } from 'child_process';
import path from 'path';

// Path to the CLI script (now compiled JS in dist)
const CLI_PATH = path.join(__dirname, '../dist/index.js');

// Helper function to execute the CLI synchronously
function runCLI(args: string[] = []): string {
  try {
    const output = execFileSync('node', [CLI_PATH, ...args], { encoding: 'utf8' });
    return output.trim();
  } catch (error: any) {
    return (error.stdout || '').trim();
  }
}

// Helper function to execute the CLI and capture stderr
function runCLIWithError(args: string[] = []): { stdout: string; stderr: string; exitCode: number } {
  try {
    const output = execFileSync('node', [CLI_PATH, ...args], { encoding: 'utf8' });
    return { stdout: output.trim(), stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || '').trim(),
      exitCode: error.status || 1
    };
  }
}

describe('learncli', () => {
  test('user enters no param', () => {
    const output = runCLI();
    expect(output).toBe("Please provide a first parameter: 'docs' or 'code'");
  });

  test('user enters "code"', () => {
    const output = runCLI(['code']);
    expect(output).toBe('hello code');
  });

  test('user enters "docs"', () => {
    const output = runCLI(['docs']);
    expect(output).toBe('hello docs');
  });

  test('user enters "anotherparam"', () => {
    const output = runCLI(['anotherparam']);
    expect(output).toBe("Please provide a first parameter: 'docs' or 'code'");
  });

  test('user enters "docs -q" without query text', () => {
    const output = runCLI(['docs', '-q']);
    expect(output).toBe('hello docs');
  });

  test('user enters "docs -q" with query text attempts to connect to MCP endpoint', () => {
    const result = runCLIWithError(['docs', '-q', 'test query']);
    // We expect it to try to connect and fail due to network restrictions
    // The error message should indicate endpoint availability issue
    expect(result.stderr).toContain('MCP endpoint');
    expect(result.exitCode).toBe(1);
  });
});
