import { Button } from "@/components/ui/button";
import type { TestStep, ActionType } from "../types";

const ACTIONS: { value: ActionType; label: string; icon: string; hasSelector: boolean; hasValue: boolean; hasAssertion: boolean }[] = [
  { value: "navigate", label: "Navigate", icon: "🌐", hasSelector: false, hasValue: true, hasAssertion: false },
  { value: "click", label: "Click", icon: "🖱️", hasSelector: true, hasValue: false, hasAssertion: false },
  { value: "type", label: "Type", icon: "⌨️", hasSelector: true, hasValue: true, hasAssertion: false },
  { value: "assert_text", label: "Assert Text", icon: "📝", hasSelector: true, hasValue: false, hasAssertion: true },
  { value: "assert_visible", label: "Assert Visible", icon: "👁️", hasSelector: true, hasValue: false, hasAssertion: false },
  { value: "assert_url", label: "Assert URL", icon: "🔗", hasSelector: false, hasValue: false, hasAssertion: true },
  { value: "wait", label: "Wait", icon: "⏱️", hasSelector: false, hasValue: true, hasAssertion: false },
  { value: "hover", label: "Hover", icon: "🎯", hasSelector: true, hasValue: false, hasAssertion: false },
  { value: "scroll", label: "Scroll", icon: "📜", hasSelector: true, hasValue: false, hasAssertion: false },
];

const ACTION_COLORS: Record<string, string> = {
  navigate: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  click: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  type: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  assert_text: "text-green-400 border-green-400/30 bg-green-400/5",
  assert_visible: "text-green-400 border-green-400/30 bg-green-400/5",
  assert_url: "text-green-400 border-green-400/30 bg-green-400/5",
  wait: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  hover: "text-pink-400 border-pink-400/30 bg-pink-400/5",
  scroll: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
};

interface Props {
  steps: TestStep[];
  setSteps: (steps: TestStep[]) => void;
}

export function TestBuilder({ steps, setSteps }: Props) {
  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), action: "click", selector: "", value: "", assertion: "" }]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, field: keyof TestStep, value: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const moveStep = (index: number, dir: "up" | "down") => {
    const arr = [...steps];
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    setSteps(arr);
  };

  return (
    <div className="space-y-3 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold tracking-[0.15em] text-foreground flex items-center gap-2">
            <span className="text-primary">⚙</span> TEST STEPS
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {steps.length === 0 ? "No steps yet — add your first step below" : `${steps.length} step${steps.length > 1 ? "s" : ""} configured`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8 text-muted-foreground tracking-wider"
            onClick={() => setSteps([])}>
            ✕ CLEAR
          </Button>
          <Button size="sm" className="text-xs h-8 font-bold tracking-wider" onClick={addStep}>
            + ADD STEP
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {steps.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-16 text-center bg-card">
          <div className="text-4xl mb-4 opacity-30">⚙</div>
          <p className="text-sm text-muted-foreground font-bold tracking-wider">NO STEPS CONFIGURED</p>
          <p className="text-xs text-muted-foreground mt-2">Click ADD STEP or use AI Generate</p>
          <Button size="sm" className="mt-6 text-xs" onClick={addStep}>+ ADD FIRST STEP</Button>
        </div>
      )}

      {/* Steps */}
      {steps.map((step, index) => {
        const actionMeta = ACTIONS.find((a) => a.value === step.action)!;
        const actionColor = ACTION_COLORS[step.action] || "";
        return (
          <div key={step.id}
            className="group relative flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all animate-fade-in">
            {/* Left accent line */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary/20 group-hover:bg-primary/60 transition-all" />

            {/* Step number + controls */}
            <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5 ml-2">
              <span className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] text-primary font-bold">
                {index + 1}
              </span>
              <button onClick={() => moveStep(index, "up")}
                className="text-muted-foreground hover:text-primary text-[10px] transition-colors leading-none">▲</button>
              <button onClick={() => moveStep(index, "down")}
                className="text-muted-foreground hover:text-primary text-[10px] transition-colors leading-none">▼</button>
            </div>

            {/* Action */}
            <div className="shrink-0">
              <label className="text-[9px] text-muted-foreground uppercase tracking-[0.12em] block mb-1.5">Action</label>
              <div className={`flex items-center gap-1.5 border rounded-lg px-2 py-1 ${actionColor}`}>
                <select value={step.action} onChange={(e) => updateStep(step.id, "action", e.target.value)}
                  className="bg-transparent text-xs outline-none cursor-pointer w-32 font-bold">
                  {ACTIONS.map((a) => (
                    <option key={a.value} value={a.value} className="bg-card text-foreground">
                      {a.icon} {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selector */}
            <div className="flex-1 min-w-0">
              <label className="text-[9px] text-muted-foreground uppercase tracking-[0.12em] block mb-1.5">
                {actionMeta.hasSelector ? "CSS Selector" : "—"}
              </label>
              <input disabled={!actionMeta.hasSelector} value={step.selector}
                onChange={(e) => updateStep(step.id, "selector", e.target.value)}
                placeholder={actionMeta.hasSelector ? "#id, .class, input[name]" : "not required"}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all placeholder:text-muted-foreground/40" />
            </div>

            {/* Value */}
            <div className="flex-1 min-w-0">
              <label className="text-[9px] text-muted-foreground uppercase tracking-[0.12em] block mb-1.5">
                {step.action === "navigate" ? "URL" : step.action === "wait" ? "Duration (ms)" : step.action === "type" ? "Text" : "Value"}
              </label>
              <input disabled={!actionMeta.hasValue} value={step.value}
                onChange={(e) => updateStep(step.id, "value", e.target.value)}
                placeholder={step.action === "navigate" ? "https://..." : step.action === "wait" ? "1000" : step.action === "type" ? "Text to type..." : "not required"}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all placeholder:text-muted-foreground/40" />
            </div>

            {/* Assertion */}
            <div className="flex-1 min-w-0">
              <label className="text-[9px] text-muted-foreground uppercase tracking-[0.12em] block mb-1.5">
                {actionMeta.hasAssertion ? "Expected" : "—"}
              </label>
              <input disabled={!actionMeta.hasAssertion} value={step.assertion}
                onChange={(e) => updateStep(step.id, "assertion", e.target.value)}
                placeholder={actionMeta.hasAssertion ? "Expected value..." : "not required"}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all placeholder:text-muted-foreground/40" />
            </div>

            {/* Delete */}
            <button onClick={() => removeStep(step.id)}
              className="shrink-0 mt-6 w-7 h-7 rounded-lg border border-transparent text-muted-foreground hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100">
              ✕
            </button>
          </div>
        );
      })}

      {/* Add step button */}
      {steps.length > 0 && (
        <button onClick={addStep}
          className="w-full border border-dashed border-border rounded-xl py-3 text-xs text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all tracking-wider">
          + ADD STEP
        </button>
      )}
    </div>
  );
}