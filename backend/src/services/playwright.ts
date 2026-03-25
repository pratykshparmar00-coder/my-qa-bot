import { chromium } from "playwright";
import type { TestStep, TestResult } from "../types";

export async function runTests(steps: TestStep[], targetUrl: string): Promise<TestResult[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results: TestResult[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const startTime = Date.now();
    let passed = false;
    let error: string | undefined;

    try {
      switch (step.action) {
        case "navigate":
          await page.goto(step.value || targetUrl, { timeout: 10000 });
          passed = true;
          break;

        case "click":
          await page.click(step.selector, { timeout: 5000 });
          passed = true;
          break;

        case "type":
          await page.fill(step.selector, step.value, { timeout: 5000 });
          passed = true;
          break;

        case "assert_text":
          const text = await page.textContent(step.selector, { timeout: 5000 });
          if (step.assertion && text?.includes(step.assertion)) {
            passed = true;
          } else {
            error = `Expected "${step.assertion}" but got "${text}"`;
          }
          break;

        case "assert_visible":
          await page.waitForSelector(step.selector, { state: "visible", timeout: 5000 });
          passed = true;
          break;

        case "assert_url":
          const url = page.url();
          if (url.includes(step.assertion)) {
            passed = true;
          } else {
            error = `Expected URL to contain "${step.assertion}" but got "${url}"`;
          }
          break;

        case "wait":
          await page.waitForTimeout(parseInt(step.value) || 1000);
          passed = true;
          break;

        case "hover":
          await page.hover(step.selector, { timeout: 5000 });
          passed = true;
          break;

        case "scroll":
          await page.locator(step.selector).scrollIntoViewIfNeeded({ timeout: 5000 });
          passed = true;
          break;

        default:
          error = `Unknown action: ${step.action}`;
      }
    } catch (err: any) {
      passed = false;
      error = err.message;
    }

    const duration = Date.now() - startTime;
    results.push({
      id: step.id,
      step: i + 1,
      action: step.action,
      selector: step.selector,
      value: step.value,
      passed,
      duration,
      error,
    });

    console.log(`  ${passed ? "✅" : "❌"} Step ${i + 1}: ${step.action} — ${duration}ms`);
  }

  await browser.close();
  return results;
}