import { SandboxConstraints } from "./SandboxConstraints";

export interface SandboxGenerateRequest {
  prompt: string;
  count?: number;
  constraints?: SandboxConstraints;
}
