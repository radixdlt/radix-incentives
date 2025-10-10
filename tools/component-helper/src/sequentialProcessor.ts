import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Effect } from 'effect';

export class SequentialProcessor extends Effect.Service<SequentialProcessor>()(
  'SequentialProcessor',
  {
    effect: Effect.gen(function* () {
      const processComponentSequentially = Effect.fn(function* (
        componentAddresses: string[],
      ) {
        const results: Array<{
          componentAddress: string;
          component: any;
          assetAdditions: any[];
          constantsAdditions: string[];
        }> = [];

        console.log(
          `\nProcessing ${componentAddresses.length} component(s) sequentially...`,
        );
        console.log(
          'Checking for missing assets and updating constants files...\n',
        );

        for (const [index, componentAddress] of componentAddresses.entries()) {
          console.log(
            `[${index + 1}/${componentAddresses.length}] Processing: ${componentAddress}`,
          );

          const result = yield* Effect.tryPromise(() => {
            return new Promise((resolve, reject) => {
              const __filename = fileURLToPath(import.meta.url);
              const __dirname = path.dirname(__filename);
              const scriptPath = path.join(__dirname, 'singleComponent.ts');
              const child = spawn('tsx', [scriptPath, componentAddress], {
                cwd: process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe'],
              });

              let stdout = '';
              let stderr = '';

              child.stdout.on('data', (data) => {
                stdout += data.toString();
              });

              child.stderr.on('data', (data) => {
                stderr += data.toString();
              });

              child.on('close', (code) => {
                if (code !== 0) {
                  reject(
                    new Error(
                      `Child process failed with code ${code}: ${stderr}`,
                    ),
                  );
                  return;
                }

                try {
                  // Extract JSON from stdout (the last line should be our JSON)
                  const lines = stdout.trim().split('\n');
                  const jsonLine = lines.find((line) =>
                    line.startsWith('{"componentAddress":'),
                  );

                  if (!jsonLine) {
                    reject(
                      new Error(
                        `No valid JSON output found in stdout: ${stdout}`,
                      ),
                    );
                    return;
                  }

                  const result = JSON.parse(jsonLine);
                  resolve(result);
                } catch (error) {
                  reject(new Error(`Failed to parse JSON output: ${error}`));
                }
              });

              child.on('error', (error) => {
                reject(new Error(`Failed to start child process: ${error}`));
              });
            });
          });

          results.push(result);

          // Small delay to ensure file system changes are reflected
          yield* Effect.sleep(100);
        }

        return results;
      });

      return { processComponentSequentially };
    }),
  },
) {}
