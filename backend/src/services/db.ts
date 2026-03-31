import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SaveResultParams {
  suiteName: string;
  targetUrl: string;
  passed: number;
  failed: number;
  total: number;
  results: any[];
}

export async function saveResult(params: SaveResultParams) {
  try {
    return await prisma.testSuite.create({
      data: {
        suiteName: params.suiteName,
        targetUrl: params.targetUrl,
        passed: params.passed,
        failed: params.failed,
        total: params.total,
        results: JSON.stringify(params.results),
      },
    });
  } catch (err) {
    console.warn("⚠ DB save failed (non-fatal):", err);
    return null;
  }
}

export async function getHistory() {
  try {
    return await prisma.testSuite.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (err) {
    console.warn("⚠ DB fetch failed:", err);
    return [];
  }
}