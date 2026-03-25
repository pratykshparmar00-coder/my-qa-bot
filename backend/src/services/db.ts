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
}

export async function getHistory() {
  return await prisma.testSuite.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}