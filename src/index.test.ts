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
});
