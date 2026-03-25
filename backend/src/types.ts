export interface TestStep {
  id: string;
  action: string;
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