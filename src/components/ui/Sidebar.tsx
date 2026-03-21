import type { TestResult } from "../types";

interface Suite {
    name: string;
    passed: number;
    failed: number;
    total: number;
}

interface Props {
    suites: Suite[];
    activeTab: string;
    setActiveTab: (tab: "builder" | "results" | "ai") => void;
    results: TestResult[];
}

export function Sidebar({ suites, activeTab, setActiveTab, results }: Props) {
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    return (
        <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-border">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 px-2">Navigation</p>
                {[
                    { id: "builder", icon: "🔧", label: "Test Builder" },
                    { id: "results", icon: "📊", label: "Results" },
                    { id: "ai", icon: "🤖", label: "AI Generate" },
                ].map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all mb-0.5 text-left ${activeTab === item.id
                                ? "bg-primary text-primary-foreground border border-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                            }`}>
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            {results.length > 0 && (
                <div className="p-3 border-b border-border">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 px-2">Current Run</p>
                    <div className="px-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Passed</span>
                            <span className="text-green-500 font-bold">{passed}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Failed</span>
                            <span className="text-red-500 font-bold">{failed}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Total</span>
                            <span className="text-foreground font-bold">{results.length}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 flex-1">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 px-2">Recent Suites</p>
                {suites.map((suite) => (
                    <div key={suite.name} className="px-2 py-2 rounded-md hover:bg-muted cursor-pointer transition-all mb-0.5">
                        <p className="text-xs text-foreground truncate">{suite.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-green-500 font-bold">{suite.passed}✓</span>
                            {suite.failed > 0 && <span className="text-[10px] text-red-500 font-bold">{suite.failed}✗</span>}
                            <span className="text-[10px] text-muted-foreground ml-auto">{suite.total} steps</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-border">
                <p className="text-[9px] text-muted-foreground text-center">QABOT v1.0.0</p>
            </div>
        </aside>
    );
}