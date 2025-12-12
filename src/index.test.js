const { execFileSync, execFile } = require('child_process');
const path = require('path');

// Path to the CLI script
const CLI_PATH = path.join(__dirname, 'index.js');

// Helper function to execute the CLI synchronously
function runCLI(args = []) {
  try {
    const output = execFileSync('node', [CLI_PATH, ...args], { encoding: 'utf8' });
    return { stdout: output, exitCode: 0 };
  } catch (error) {
    return { 
      stdout: error.stdout || '', 
      stderr: error.stderr || '',
      exitCode: error.status || 1 
    };
  }
}

// Helper function to execute the CLI asynchronously (for timeout tests)
function runCLIAsync(args = [], timeout = 5000) {
  return new Promise((resolve, reject) => {
    execFile('node', [CLI_PATH, ...args], { timeout }, (error, stdout, stderr) => {
      if (error && !error.killed) {
        resolve({ 
          stdout: stdout || '', 
          stderr: stderr || '',
          exitCode: error.code || 1 
        });
      } else if (error && error.killed) {
        reject(new Error('Command timeout'));
      } else {
        resolve({ stdout, stderr, exitCode: 0 });
      }
    });
  });
}

describe('learncli - Basic Execution', () => {
  test('should execute without arguments', () => {
    const result = runCLI();
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should execute and return output', () => {
    const result = runCLI();
    expect(result.stdout).toBeTruthy();
    expect(result.stdout.trim()).toBe('hello world');
  });
});

describe('learncli - Command-Line Arguments', () => {
  test('should handle single string argument', () => {
    const result = runCLI(['test']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle multiple string arguments', () => {
    const result = runCLI(['arg1', 'arg2', 'arg3']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle numeric arguments', () => {
    const result = runCLI(['123', '456']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle negative numbers', () => {
    const result = runCLI(['-123', '-456']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle decimal numbers', () => {
    const result = runCLI(['3.14', '2.71']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle mixed argument types', () => {
    const result = runCLI(['text', '123', 'more-text']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });
});

describe('learncli - Flags and Options', () => {
  test('should handle --help flag', () => {
    const result = runCLI(['--help']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle -h flag', () => {
    const result = runCLI(['-h']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle --version flag', () => {
    const result = runCLI(['--version']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle -v flag', () => {
    const result = runCLI(['-v']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle custom flags', () => {
    const result = runCLI(['--custom', '--flag']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle flags with values', () => {
    const result = runCLI(['--option=value', '--key=123']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });
});

describe('learncli - Special Characters', () => {
  test('should handle arguments with spaces (quoted)', () => {
    const result = runCLI(['"hello world"']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle special characters', () => {
    const result = runCLI(['@', '#', '$', '%']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle hyphens and underscores', () => {
    const result = runCLI(['test-arg', 'test_arg']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle forward slashes', () => {
    const result = runCLI(['path/to/file']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle backslashes', () => {
    const result = runCLI(['path\\to\\file']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle equals signs', () => {
    const result = runCLI(['key=value']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle dots and commas', () => {
    const result = runCLI(['file.txt', 'a,b,c']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });
});

describe('learncli - Edge Cases', () => {
  test('should handle empty string argument', () => {
    const result = runCLI(['""']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle very long arguments', () => {
    const longArg = 'a'.repeat(1000);
    const result = runCLI([longArg]);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle many arguments', () => {
    const manyArgs = Array(100).fill('arg');
    const result = runCLI(manyArgs);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle arguments with unicode characters', () => {
    const result = runCLI(['你好', 'مرحبا', '👋']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle arguments with newlines (escaped)', () => {
    const result = runCLI(['line1\\nline2']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle boolean-like values', () => {
    const result = runCLI(['true', 'false']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle null-like values', () => {
    const result = runCLI(['null', 'undefined']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle JSON-like strings', () => {
    const result = runCLI(['{"key":"value"}']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle URL-like strings', () => {
    const result = runCLI(['https://example.com']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });

  test('should handle email-like strings', () => {
    const result = runCLI(['user@example.com']);
    expect(result.stdout).toContain('hello world');
    expect(result.exitCode).toBe(0);
  });
});

describe('learncli - Performance and Reliability', () => {
  test('should complete execution quickly', async () => {
    const start = Date.now();
    const result = await runCLIAsync();
    const duration = Date.now() - start;
    
    expect(result.stdout).toContain('hello world');
    expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
  });

  test('should produce consistent output', () => {
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(runCLI());
    }
    
    // All results should be identical
    results.forEach(result => {
      expect(result.stdout).toBe(results[0].stdout);
      expect(result.exitCode).toBe(0);
    });
  });

  test('should not throw errors with valid inputs', () => {
    expect(() => runCLI()).not.toThrow();
    expect(() => runCLI(['arg'])).not.toThrow();
    expect(() => runCLI(['--flag'])).not.toThrow();
  });
});

describe('learncli - Output Validation', () => {
  test('should output to stdout, not stderr', () => {
    const result = runCLI();
    expect(result.stdout).toContain('hello world');
    expect(result.stderr || '').toBe('');
  });

  test('should include newline in output', () => {
    const result = runCLI();
    expect(result.stdout).toMatch(/hello world\n/);
  });

  test('should exit with code 0 on success', () => {
    const result = runCLI();
    expect(result.exitCode).toBe(0);
  });
});
