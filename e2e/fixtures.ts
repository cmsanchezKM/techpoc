import { test as base } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

export const test = base.extend({
  autoTestFixture: [
    async ({ page }, use) => {
      await Promise.all([
        page.coverage.startJSCoverage({ resetOnNavigation: false }),
        page.coverage.startCSSCoverage({ resetOnNavigation: false }),
      ]);

      await use('autoTestFixture');

      const [jsCoverageList, cssCoverageList] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
      ]);

      await addCoverageReport([...jsCoverageList, ...cssCoverageList], test.info());
    },
    { scope: 'test', auto: true },
  ],
});

export const expect = test.expect;
