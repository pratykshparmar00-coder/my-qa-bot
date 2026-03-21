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
        <div className="space-y-3 max-w-4xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-bold tracking-widest">TEST STEPS</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Build your test flow step by step</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setSteps([])}>CLEAR ALL</Button>
                    <Button size="sm" className="text-xs h-8 font-bold" onClick={addStep}>+ ADD STEP</Button>
                </div>
            </div>

            {steps.length === 0 && (
                <div className="border border-dashed border-border rounded-lg p-10 text-center">
                    <p className="text-muted-foreground text-xs">No steps yet. Click "ADD STEP" or use AI Generate.</p>
                </div>
            )}

            {steps.map((step, index) => {
                const actionMeta = ACTIONS.find((a) => a.value === step.action)!;
                return (
                    <div key={step.id} className="group flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:border-ring transition-all">
                        <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                            <span className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground font-bold">
                                {index + 1}
                            </span>
                            <button onClick={() => moveStep(index, "up")} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
                            <button onClick={() => moveStep(index, "down")} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
                        </div>

                        <div className="shrink-0">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Action</label>
                            <select value={step.action} onChange={(e) => updateStep(step.id, "action", e.target.value)}
                                className="bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:border-ring w-36 cursor-pointer">
                                {ACTIONS.map((a) => (
                                    <option key={a.value} value={a.value}>{a.icon} {a.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-0">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                                {actionMeta.hasSelector ? "CSS Selector" : "—"}
                            </label>
                            <input disabled={!actionMeta.hasSelector} value={step.selector}
                                onChange={(e) => updateStep(step.id, "selector", e.target.value)}
                                placeholder={actionMeta.hasSelector ? "#btn, .class, input[name='email']" : "N/A"}
                                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:border-ring disabled:opacity-30 disabled:cursor-not-allowed" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                                {step.action === "navigate" ? "URL" : step.action === "wait" ? "Milliseconds" : step.action === "type" ? "Text to type" : "Value"}
                            </label>
                            <input disabled={!actionMeta.hasValue} value={step.value}
                                onChange={(e) => updateStep(step.id, "value", e.target.value)}
                                placeholder={step.action === "navigate" ? "https://..." : step.action === "wait" ? "1000" : step.action === "type" ? "Enter text..." : "—"}
                                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:border-ring disabled:opacity-30 disabled:cursor-not-allowed" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                                {actionMeta.hasAssertion ? "Expected Value" : "—"}
                            </label>
                            <input disabled={!actionMeta.hasAssertion} value={step.assertion}
                                onChange={(e) => updateStep(step.id, "assertion", e.target.value)}
                                placeholder={actionMeta.hasAssertion ? "Expected text or URL..." : "—"}
                                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:border-ring disabled:opacity-30 disabled:cursor-not-allowed" />
                        </div>

                        <button onClick={() => removeStep(step.id)}
                            className="shrink-0 mt-6 w-7 h-7 rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100">
                            ✕
                        </button>
                    </div>
                );
            })}

            {steps.length > 0 && (
                <button onClick={addStep} className="w-full border border-dashed border-border rounded-lg py-3 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all">
                    + ADD STEP
                </button>
            )}
        </div>
    );
}