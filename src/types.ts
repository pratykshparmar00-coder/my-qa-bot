export type ActionType =
    | "navigate"
    | "click"
    | "type"
    | "assert_text"
    | "assert_visible"
    | "assert_url"
    | "wait"
    | "hover"
    | "scroll";

export interface TestStep {
    id: string;
    action: ActionType;
    selector: string;
    value: string;
    assertion: string;
}

export interface TestResult {
    id: string;
    step: number;
    action: string;
    selector: string;
    value: string;
    passed: boolean;
    duration: number;
    error?: string;
}

export interface LogEntry {
    id: string;
    message: string;
    type: "info" | "success" | "error" | "warn";
    timestamp: string;
}