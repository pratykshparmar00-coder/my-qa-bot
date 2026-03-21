import { useEffect, useRef } from "react";
import type { LogEntry } from "../types";

interface Props {
  logs: LogEntry[];
}

export function ConsoleLog({ logs }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const colorMap: Record<LogEntry["type"], string> = {
    info: "text-muted-foreground",
    success: "text-green-400",
    error: "text-red-400",
    warn: "text-yellow-400",
  };

  const bgMap: Record<LogEntry["type"], string> = {
    info: "",
    success: "bg-green-500/5",
    error: "bg-red-500/5",
    warn: "bg-yellow-500/5",
  };

  return (
    <div className="w-72 border-l border-border flex flex-col shrink-0 relative bg-card/20 backdrop-blur-sm">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
          <span className="text-[10px] font-bold tracking-[0.15em] text-primary uppercase">Console</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{logs.length} entries</span>
          {logs.length > 0 && (
            <span className="text-[10px] text-green-500">
              {logs.filter(l => l.type === "success").length}✓
            </span>
          )}
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-2xl opacity-20">⬡</span>
            <p className="text-[10px] text-muted-foreground italic tracking-wider">Waiting for test run...</p>
            <span className="text-primary text-xs animate-blink">_</span>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id}
            className={`flex gap-2 text-[10px] leading-relaxed px-2 py-1 rounded transition-all animate-fade-in ${bgMap[log.type]}`}>
            <span className="text-muted-foreground/40 shrink-0 select-none tabular-nums">{log.timestamp}</span>
            <span className={`${colorMap[log.type]} break-all`}>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-card/40">
        <div className="flex items-center gap-1.5">
          <span className="text-primary text-xs animate-blink">▋</span>
          <span className="text-[10px] text-muted-foreground">
            {logs.length === 0 ? "ready" : logs[logs.length - 1]?.type === "error" ? "error detected" : "ok"}
          </span>
        </div>
      </div>
    </div>
  );
}