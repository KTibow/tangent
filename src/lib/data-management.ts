export const syncObjects = (oldObj: Record<string, string>, newObj: Record<string, string>) => {
  for (const key of new Set([...Object.keys(oldObj), ...Object.keys(newObj)])) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    if (oldVal != newVal) {
      if (newVal == undefined) {
        delete oldObj[key];
      } else {
        oldObj[key] = newVal;
      }
    }
  }
};
