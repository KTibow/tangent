export const first = /* @__PURE__ */ <T>(thing: T | T[]) =>
  Array.isArray(thing) ? thing[0] : thing;
export const iterating = /* @__PURE__ */ <T>(thing: T | T[]) =>
  Array.isArray(thing) ? thing : !thing ? [] : [thing];
