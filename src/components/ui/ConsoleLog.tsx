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
        success: "text-green-500",
        error: "text-red-400",
        warn: "text-yellow-400",
    };

    return (
        <div className="w-72 border-l border-border bg-card flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Console</span>
                <span className="text-[10px] text-muted-foreground">{logs.length} entries</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono">
                {logs.length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic">Waiting for test run...</p>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 text-[10px] leading-relaxed">
                        <span className="text-muted-foreground/50 shrink-0 select-none">{log.timestamp}</span>
                        <span className={`${colorMap[log.type]} break-all`}>{log.message}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}