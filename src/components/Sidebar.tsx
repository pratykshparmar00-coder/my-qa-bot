import type { TestResult } from "../types";
import type { HistoryEntry } from "../App";

interface Suite {
  name: string;
  passed: number;
  failed: number;
  total: number;
}

interface Props {
  suites: Suite[];
  activeTab: string;
  setActiveTab: (tab: "builder" | "results" | "ai" | "history") => void;
  results: TestResult[];
  history: HistoryEntry[];
}

export function Sidebar({ suites, activeTab, setActiveTab, results, history }: Props) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return (
    <aside className="w-56 border-r border-border flex flex-col shrink-0 overflow-y-auto relative bg-card/30 backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] text-primary uppercase tracking-[0.2em] font-bold">◈ QABOT SYSTEM</span>
        </div>
        <div className="h-px bg-gradient-to-r from-primary/50 to-transparent mt-2" />
      </div>

      <div className="p-3 border-b border-border">
        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-3 px-2">Navigation</p>
        {[
          { id: "builder", icon: "⚙", label: "Test Builder" },
          { id: "results", icon: "◈", label: "Results" },
          { id: "ai", icon: "◎", label: "AI Generate" },
          { id: "history", icon: "⏱", label: `History ${history.length > 0 ? `(${history.length})` : ""}` },
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all mb-1 text-left relative overflow-hidden ${activeTab === item.id
                ? "bg-primary/10 text-primary border border-primary/30 glow-border"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent"
              }`}>
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full" />
            )}
            <span className={activeTab === item.id ? "text-primary" : ""}>{item.icon}</span>
            <span className="font-bold tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="p-3 border-b border-border">
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-3 px-2">Current Run</p>
          <div className="px-2 space-y-2">
            {[
              { label: "Passed", value: passed, color: "text-green-500" },
              { label: "Failed", value: failed, color: "text-red-500" },
              { label: "Total", value: results.length, color: "text-foreground" },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
            <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${results.length > 0 ? (passed / results.length) * 100 : 0}%`, boxShadow: '0 0 8px rgba(0,255,100,0.6)' }} />
            </div>
          </div>
        </div>
      )}

      <div className="p-3 flex-1">
        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-3 px-2">Recent Suites</p>
        {suites.map((suite) => (
          <div key={suite.name} className="px-3 py-2.5 rounded-lg hover:bg-muted/30 cursor-pointer transition-all mb-1 border border-transparent hover:border-border group">
            <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">{suite.name}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${(suite.passed / suite.total) * 100}%` }} />
              </div>
              <span className="text-[10px] text-green-500 font-bold">{suite.passed}✓</span>
              {suite.failed > 0 && <span className="text-[10px] text-red-500 font-bold">{suite.failed}✗</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">QABOT v1.0.0</span>
          <span className="text-[9px] text-primary">● ONLINE</span>
        </div>
        <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mt-2" />
      </div>
    </aside>
  );
}