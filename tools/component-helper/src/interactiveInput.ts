import fs from 'node:fs/promises';
import path from 'node:path';
import { Effect } from 'effect';
import inquirer from 'inquirer';

type InputMethod = 'single' | 'multiple' | 'file';

export class InteractiveInput extends Effect.Service<InteractiveInput>()(
  'InteractiveInput',
  {
    effect: Effect.gen(function* () {
      const promptForInputMethod = Effect.fn(function* () {
        const { inputMethod } = yield* Effect.tryPromise(() =>
          inquirer.prompt([
            {
              type: 'list',
              name: 'inputMethod',
              message: 'How would you like to provide component addresses?',
              choices: [
                {
                  name: 'Single component address',
                  value: 'single',
                },
                {
                  name: 'Multiple component addresses (comma-separated)',
                  value: 'multiple',
                },
                {
                  name: 'CSV file with component addresses',
                  value: 'file',
                },
              ],
            },
          ]),
        );
        return inputMethod as InputMethod;
      });

      const promptForSingleComponent = Effect.fn(function* () {
        const { componentAddress } = yield* Effect.tryPromise(() =>
          inquirer.prompt([
            {
              type: 'input',
              name: 'componentAddress',
              message: 'Enter the component address:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Component address cannot be empty';
                }
                if (!input.startsWith('component_rdx1')) {
                  return 'Component address must start with "component_rdx1"';
                }
                return true;
              },
            },
          ]),
        );
        return [componentAddress.trim()];
      });

      const promptForMultipleComponents = Effect.fn(function* () {
        const { componentAddresses } = yield* Effect.tryPromise(() =>
          inquirer.prompt([
            {
              type: 'input',
              name: 'componentAddresses',
              message: 'Enter component addresses (comma-separated):',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Component addresses cannot be empty';
                }
                const addresses = input.split(',').map((addr) => addr.trim());
                for (const addr of addresses) {
                  if (!addr.startsWith('component_rdx1')) {
                    return `Invalid component address: ${addr}. All addresses must start with "component_rdx1"`;
                  }
                }
                return true;
              },
            },
          ]),
        );
        return componentAddresses
          .split(',')
          .map((addr: string) => addr.trim())
          .filter((addr: string) => addr.length > 0);
      });

      const promptForCsvFile = Effect.fn(function* () {
        const { filePath } = yield* Effect.tryPromise(() =>
          inquirer.prompt([
            {
              type: 'input',
              name: 'filePath',
              message: 'Enter the path to your CSV file:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'File path cannot be empty';
                }
                if (!input.endsWith('.csv')) {
                  return 'File must be a .csv file';
                }
                return true;
              },
            },
          ]),
        );
        return filePath.trim();
      });

      const parseCsvFile = Effect.fn(function* (filePath: string) {
        // Resolve path relative to current working directory if it's a relative path
        const resolvedPath = filePath.startsWith('/')
          ? filePath
          : path.join(process.cwd(), filePath);

        // Check if file exists
        yield* Effect.tryPromise(() => fs.access(resolvedPath));

        // Read file content
        const content = yield* Effect.tryPromise(() =>
          fs.readFile(resolvedPath, 'utf-8'),
        );

        // Parse CSV content
        const lines = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        // Remove header if it exists (check if first line doesn't start with component_rdx1)
        const startIndex =
          lines[0] && !lines[0].startsWith('component_rdx1') ? 1 : 0;

        const componentAddresses: string[] = [];

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          // Handle both simple CSV (one address per line) and comma-separated values
          const addresses = line
            .split(',')
            .map((addr) => addr.trim().replace(/"/g, ''));

          for (const addr of addresses) {
            if (addr?.startsWith('component_rdx1')) {
              componentAddresses.push(addr);
            } else if (addr && addr.length > 0) {
              console.warn(`Skipping invalid component address: ${addr}`);
            }
          }
        }

        if (componentAddresses.length === 0) {
          return yield* Effect.fail(
            new Error('No valid component addresses found in CSV file'),
          );
        }

        console.log(
          `Found ${componentAddresses.length} valid component addresses in CSV file`,
        );
        return componentAddresses;
      });

      const getComponentAddresses = Effect.fn(function* () {
        const inputMethod = yield* promptForInputMethod();

        switch (inputMethod) {
          case 'single':
            return yield* promptForSingleComponent();

          case 'multiple':
            return yield* promptForMultipleComponents();

          case 'file': {
            const filePath = yield* promptForCsvFile();
            return yield* parseCsvFile(filePath);
          }

          default:
            return yield* Effect.fail(
              new Error(`Unknown input method: ${inputMethod}`),
            );
        }
      });

      const confirmProcessing = Effect.fn(function* (
        componentAddresses: string[],
      ) {
        if (componentAddresses.length === 1) {
          return true; // No confirmation needed for single component
        }

        console.log(
          `\nFound ${componentAddresses.length} component addresses:`,
        );
        componentAddresses.forEach((addr, index) => {
          console.log(`  ${index + 1}. ${addr}`);
        });

        const { proceed } = yield* Effect.tryPromise(() =>
          inquirer.prompt([
            {
              type: 'confirm',
              name: 'proceed',
              message: `Do you want to process all ${componentAddresses.length} components?`,
              default: true,
            },
          ]),
        );

        return proceed;
      });

      return {
        getComponentAddresses,
        confirmProcessing,
        parseCsvFile,
      };
    }),
  },
) {}
