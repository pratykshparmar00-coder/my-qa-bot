import type { TestResult } from "../types";

interface Props {
    results: TestResult[];
    running: boolean;
}

export function ResultsPanel({ results, running }: Props) {
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    if (results.length === 0 && !running) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-4">🧪</div>
                <p className="text-sm font-bold text-muted-foreground">No results yet</p>
                <p className="text-xs text-muted-foreground mt-1">Run your test suite to see results here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-4xl">
            {total > 0 && (
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "TOTAL", value: total, color: "text-foreground" },
                        { label: "PASSED", value: passed, color: "text-green-500" },
                        { label: "FAILED", value: failed, color: "text-red-500" },
                        { label: "PASS RATE", value: `${passRate}%`, color: passRate === 100 ? "text-green-500" : passRate > 60 ? "text-yellow-500" : "text-red-500" },
                    ].map((stat) => (
                        <div key={stat.label} className="border border-border rounded-lg p-3 bg-card">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {total > 0 && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500 rounded-full" style={{ width: `${passRate}%` }} />
                </div>
            )}

            <div className="space-y-2">
                {results.map((result) => (
                    <div key={result.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${result.passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <span className={`text-sm mt-0.5 shrink-0 ${result.passed ? "text-green-500" : "text-red-500"}`}>
                            {result.passed ? "✅" : "❌"}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-muted-foreground">STEP {result.step}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-bold uppercase ${result.passed ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                    {result.action.replace("_", " ")}
                                </span>
                                {result.selector && (
                                    <code className="text-xs text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">{result.selector}</code>
                                )}
                                {result.value && (
                                    <span className="text-xs text-muted-foreground truncate max-w-xs">"{result.value}"</span>
                                )}
                            </div>
                            {result.error && <p className="text-xs text-red-400 mt-1">{result.error}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{result.duration}ms</span>
                    </div>
                ))}

                {running && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                        <span className="animate-spin text-sm">⏳</span>
                        <span className="text-xs text-yellow-500">Running next step...</span>
                    </div>
                )}
            </div>
        </div>
    );
}