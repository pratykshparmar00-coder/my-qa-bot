import { Router, Request, Response } from "express";
import { runTests } from "../services/playwright";
import { saveResult } from "../services/db";

export const testRouter = Router();

testRouter.post("/run", async (req: Request, res: Response) => {
  const { steps, targetUrl, suiteName } = req.body;

  if (!steps || !targetUrl) {
    res.status(400).json({ error: "steps and targetUrl are required" });
    return;
  }

  try {
    console.log(`▶ Running ${steps.length} steps on ${targetUrl}`);
    const results = await runTests(steps, targetUrl);

    const passed = results.filter((r: any) => r.passed).length;
    const failed = results.filter((r: any) => !r.passed).length;

    // Save to database
    await saveResult({
      suiteName: suiteName || "Unnamed Suite",
      targetUrl,
      passed,
      failed,
      total: results.length,
      results,
    });

    res.json({ success: true, results, passed, failed, total: results.length });
  } catch (err: any) {
    console.error("Test run error:", err);
    res.status(500).json({ error: err.message });
  }
});

testRouter.get("/history", async (req: Request, res: Response) => {
  try {
    const { getHistory } = await import("../services/db");
    const history = await getHistory();
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});