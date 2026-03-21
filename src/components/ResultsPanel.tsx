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
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <div className="text-5xl opacity-20">◈</div>
        <div>
          <p className="text-sm font-bold tracking-widest text-muted-foreground">NO RESULTS YET</p>
          <p className="text-xs text-muted-foreground mt-1">Run your test suite to see results here</p>
        </div>
        <span className="text-primary text-sm animate-blink">_</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Summary cards */}
      {total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "TOTAL", value: total, color: "text-foreground", border: "border-border" },
            { label: "PASSED", value: passed, color: "text-green-400", border: "border-green-500/20", bg: "bg-green-500/5" },
            { label: "FAILED", value: failed, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
            {
              label: "PASS RATE", value: `${passRate}%`,
              color: passRate === 100 ? "text-green-400" : passRate > 60 ? "text-yellow-400" : "text-red-400",
              border: passRate === 100 ? "border-green-500/20" : "border-border",
              bg: passRate === 100 ? "bg-green-500/5" : ""
            },
          ].map((stat) => (
            <div key={stat.label} className={`border ${stat.border} ${stat.bg || ""} rounded-xl p-4 bg-card/50 backdrop-blur-sm relative overflow-hidden`}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-700 rounded-full"
            style={{ width: `${passRate}%`, boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
        </div>
      )}

      {/* Results list */}
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all animate-fade-in backdrop-blur-sm ${result.passed
                ? "border-green-500/20 bg-green-500/5 hover:border-green-500/40"
                : "border-red-500/20 bg-red-500/5 hover:border-red-500/40"
              }`}>
            {/* Status icon */}
            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mt-0.5 ${result.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}>
              {result.passed ? "✓" : "✗"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider">STEP {result.step}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${result.passed
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                  {result.action.replace("_", " ")}
                </span>
                {result.selector && (
                  <code className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border">
                    {result.selector}
                  </code>
                )}
                {result.value && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-xs">"{result.value}"</span>
                )}
              </div>
              {result.error && (
                <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {result.error}
                </p>
              )}
            </div>

            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{result.duration}ms</span>
          </div>
        ))}

        {/* Running indicator */}
        {running && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 animate-fade-in">
            <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-yellow-400 text-xs animate-spin">◎</span>
            </div>
            <span className="text-xs text-yellow-400 tracking-wider">EXECUTING NEXT STEP...</span>
            <span className="text-yellow-400 text-xs animate-blink ml-auto">_</span>
          </div>
        )}
      </div>
    </div>
  );
}