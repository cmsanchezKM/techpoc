import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [
    ['html'],
    [
      'monocart-reporter',
      {
        name: 'Cobertura e2e - techpoc',
        outputFile: './coverage/e2e/index.html',
        coverage: {
          entryFilter: (entry: { url: string }) => entry.url.includes('localhost:4200'),
          sourceFilter: (sourcePath: string) =>
            sourcePath.search(/src\//) !== -1 && sourcePath.search(/\.spec\.ts$/) === -1,
          reports: [['v8'], ['json-summary'], ['json'], ['console-summary']],
        },
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
