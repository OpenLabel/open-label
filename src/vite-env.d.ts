/// <reference types="vite/client" />

declare module "virtual:build-status" {
  const buildStatus: {
    status: "pass" | "fail" | "unknown";
    message?: string;
  };
  export default buildStatus;
}
