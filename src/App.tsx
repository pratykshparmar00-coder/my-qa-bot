import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TestBuilder } from "./components/TestBuilder";
import { ResultsPanel } from "./components/ResultsPanel";
import { ConsoleLog } from "./components/ConsoleLog";
import { Sidebar } from "./components/Sidebar";
import type { TestStep, TestResult, LogEntry } from "./types";

export interface HistoryEntry {
  id: string;
  name: string;
  date: string;
  passed: number;
  failed: number;
  total: number;
  results: TestResult[];
}

export default function App() {
  const [targetUrl, setTargetUrl] = useState("http://localhost:5173");
  const [testName, setTestName] = useState("My Test Suite");
  const [steps, setSteps] = useState<TestStep[]>([
    { id: "1", action: "navigate", selector: "", value: "", assertion: "" },
  ]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "results" | "ai" | "history">("builder");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem("qabot-history") || "[]"); } catch { return []; }
  });
  const suites = history.slice(0, 5).map((h) => ({
    name: h.name,
    passed: h.passed,
    failed: h.failed,
    total: h.total,
  }));
  const abortRef = useRef(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("qabot-history", JSON.stringify(history));
  }, [history]);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      { id: Date.now().toString(), message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const runTests = async () => {
    if (running) { abortRef.current = true; setRunning(false); return; }
    setRunning(true);
    abortRef.current = false;
    setResults([]);
    setLogs([]);
    setActiveTab("results");
    addLog(`🚀 Starting: "${testName}"`, "info");
    addLog(`🌐 Target: ${targetUrl}`, "info");
    addLog(`📋 Steps: ${steps.length}`, "info");

    try {
      const response = await fetch("https://my-qa-bot-production.up.railway.app/api/test/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps, targetUrl, suiteName: testName })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to run tests");

      const newResults = data.results as TestResult[];
      setResults(newResults);

      newResults.forEach((r) => {
        addLog(`▶ [${r.action.toUpperCase()}] ${r.selector || r.value || targetUrl}`, "info");
        if (r.passed) addLog(`  ✅ Passed in ${r.duration}ms`, "success");
        else addLog(`  ❌ ${r.error}`, "error");
      });

      const p = data.passed;
      const f = data.failed;
      addLog(`━━━━━━━━━━━━━━━━━━━━━━`, "info");
      addLog(`📊 ${p} passed · ${f} failed · ${data.total} total`, p === data.total ? "success" : "warn");

      const entry: HistoryEntry = {
        id: Date.now().toString(),
        name: testName,
        date: new Date().toLocaleString(),
        passed: p,
        failed: f,
        total: data.total,
        results: newResults,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));

    } catch (err: any) {
      addLog(`⛔ Error: ${err.message}`, "error");
    } finally {
      setRunning(false);
    }
  };

  const exportJSON = () => {
    const data = { suite: testName, url: targetUrl, date: new Date().toISOString(), results };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${testName.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = "Step,Action,Selector,Value,Passed,Duration,Error";
    const rows = results.map(r => `${r.step},${r.action},${r.selector},${r.value},${r.passed},${r.duration}ms,${r.error || ""}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${testName.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert QA automation engineer. Generate UI test steps as a JSON array. Each step: action (navigate|click|type|assert_text|assert_visible|assert_url|wait|hover|scroll), selector, value, assertion. Respond ONLY with valid JSON array, no markdown.`,
          messages: [{ role: "user", content: `Generate test steps for: ${aiPrompt}\nURL: ${targetUrl}` }],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed)) {
          setSteps(parsed.map((s, i) => ({ ...s, id: Date.now().toString() + i })));
          setAiResponse(`✅ Generated ${parsed.length} steps!`);
          setActiveTab("builder");
        }
      } catch { setAiResponse(text); }
    } catch { setAiResponse("⚠️ Error connecting to AI."); }
    setAiLoading(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Sidebar suites={suites} activeTab={activeTab} setActiveTab={setActiveTab} results={results} history={history} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              QA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-widest text-foreground">QABOT</span>
                <span className="text-[10px] text-primary border border-primary/30 px-1.5 py-0.5 rounded font-bold">v1.0</span>
              </div>
              <p className="text-[10px] text-muted-foreground tracking-widest">AUTONOMOUS UI TESTING</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={exportJSON}
                  className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  ↓ JSON
                </button>
                <button onClick={exportCSV}
                  className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  ↓ CSV
                </button>
              </div>
            )}

            {results.length > 0 && (
              <div className="flex items-center gap-2 text-xs border border-border rounded-lg px-3 py-1.5 bg-background">
                <span className="text-green-500 font-bold">{results.filter(r => r.passed).length}✓</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-red-500 font-bold">{results.filter(r => !r.passed).length}✗</span>
              </div>
            )}

            <button onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-sm hover:border-primary hover:text-primary transition-all text-muted-foreground">
              {isDark ? "☀" : "◑"}
            </button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5">
              <span className={`w-2 h-2 rounded-full ${running ? "bg-yellow-400 animate-pulse" : "bg-primary"}`} />
              <span className={running ? "text-yellow-400" : "text-primary"}>{running ? "RUNNING" : "READY"}</span>
            </div>

            <Button size="sm" variant={running ? "destructive" : "default"} onClick={runTests}
              className={`text-xs font-bold tracking-widest h-8 px-4`}>
              {running ? "⛔ ABORT" : "▶ RUN TESTS"}
            </Button>
          </div>
        </header>

        {/* URL Bar */}
        <div className="flex items-center gap-4 px-6 py-2.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Suite</span>
            <input value={testName} onChange={(e) => setTestName(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground w-44 transition-all" />
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest shrink-0">Target</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xs">⬡</span>
              <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-foreground transition-all" />
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-7 px-3 text-muted-foreground"
            onClick={() => { setSteps([{ id: "1", action: "navigate", selector: "", value: "", assertion: "" }]); setResults([]); setLogs([]); }}>
            RESET
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 bg-card px-2 pt-1">
          {(["builder", "results", "ai", "history"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-xs font-bold tracking-widest uppercase transition-all border-b-2 rounded-t-md mr-1 ${activeTab === tab
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}>
              {tab === "builder" ? "⚙ Builder"
                : tab === "results" ? `◈ Results${results.length ? ` (${results.filter(r => r.passed).length}/${results.length})` : ""}`
                  : tab === "ai" ? "◎ AI"
                    : `⏱ History${history.length ? ` (${history.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "builder" && <TestBuilder steps={steps} setSteps={setSteps} />}
            {activeTab === "results" && <ResultsPanel results={results} running={running} />}
            {activeTab === "history" && (
              <div className="space-y-3 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-bold tracking-widest flex items-center gap-2">
                      <span className="text-primary">⏱</span> TEST HISTORY
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">{history.length} past runs saved locally</p>
                  </div>
                  {history.length > 0 && (
                    <button onClick={() => setHistory([])}
                      className="text-[10px] text-muted-foreground hover:text-red-500 border border-border hover:border-red-500/50 px-3 py-1.5 rounded-lg transition-all tracking-wider">
                      ✕ CLEAR HISTORY
                    </button>
                  )}
                </div>

                {history.length === 0 && (
                  <div className="border border-dashed border-border rounded-xl p-16 text-center">
                    <div className="text-4xl opacity-20 mb-4">⏱</div>
                    <p className="text-sm text-muted-foreground font-bold tracking-wider">NO HISTORY YET</p>
                    <p className="text-xs text-muted-foreground mt-2">Run a test suite to see history here</p>
                  </div>
                )}

                {history.map((entry) => (
                  <div key={entry.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => { setResults(entry.results); setActiveTab("results"); }}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border ${entry.failed === 0
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}>
                      {entry.failed === 0 ? "✓" : "!"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{entry.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{entry.date}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="text-green-500 font-bold">{entry.passed}✓</span>
                      {entry.failed > 0 && <span className="text-red-500 font-bold">{entry.failed}✗</span>}
                      <span className="text-muted-foreground">{entry.total} steps</span>
                      <span className={`px-2 py-1 rounded-md font-bold border text-[10px] ${entry.failed === 0
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                        {Math.round((entry.passed / entry.total) * 100)}%
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs group-hover:text-primary transition-colors">→</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "ai" && (
              <div className="space-y-4 max-w-2xl">
                <div className="border border-border rounded-xl p-5 bg-card">
                  <h2 className="text-sm font-bold tracking-widest text-primary mb-1">◎ AI TEST GENERATOR</h2>
                  <p className="text-xs text-muted-foreground mb-4">Describe what to test in plain English.</p>
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4}
                    placeholder="e.g. Test the login flow: go to /login, type email and password, click submit, assert dashboard is visible..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-xs text-foreground resize-none transition-all" />
                  <Button onClick={generateWithAI} disabled={aiLoading} className="mt-3 text-xs font-bold tracking-widest h-8">
                    {aiLoading ? "⏳ GENERATING..." : "◎ GENERATE STEPS"}
                  </Button>
                </div>
                {aiResponse && (
                  <div className={`border rounded-xl p-4 text-xs ${aiResponse.startsWith("✅") ? "border-primary/30 bg-primary/5 text-primary" : "border-border bg-card"}`}>
                    {aiResponse}
                  </div>
                )}
                <div className="border border-border rounded-xl p-4 bg-card">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">💡 Example Prompts</p>
                  {[
                    "Test homepage loads and hero heading is visible",
                    "Test signup form: fill name, email, password and submit",
                    "Navigate to /products, click first item, assert detail page",
                    "Check navbar has Login and Signup buttons",
                  ].map((p) => (
                    <button key={p} onClick={() => setAiPrompt(p)}
                      className="block text-left text-xs text-muted-foreground hover:text-primary py-2 border-b border-border/50 last:border-0 w-full transition-colors">
                      <span className="text-primary mr-2">→</span>{p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <ConsoleLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
