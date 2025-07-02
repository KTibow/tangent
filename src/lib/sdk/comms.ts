export type FromTangent = { storage: Record<string, string> };
export type FromApp =
  | { type: "keyup-alt" }
  | { type: "mousemove"; x: number; y: number }
  | { type: "storage-set"; key: string; value: string }
  | { type: "storage-delete"; key: string }
  | { type: "ready" }
  | { type: "close" }
  | { type: "launch"; name: string; popup: boolean };
