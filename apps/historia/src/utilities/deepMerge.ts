// Based on https://github.com/payloadcms/website-cms/blob/main/src/utilities/deepMerge.ts

/**
 * Checks if the given item is an object.
 * @param item - The item to check.
 * @returns True if the item is an object, false otherwise.
 */
export function isObject<T>(item: T): boolean {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deeply merges multiple objects into a single object.
 * @param target - The target object to merge into.
 * @param sources - The source objects to merge from.
 * @returns The merged object.
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  const output: T = { ...target };
  for (const source of sources) {
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        // @ts-ignore
        const srcVal = source[key];
        if (isObject(srcVal)) {
          // @ts-ignore
          if (!(key in target) || !isObject(target[key])) {
            // @ts-ignore
            output[key] = srcVal;
          } else {
            // @ts-ignore
            output[key] = deepMerge(target[key] as any, srcVal);
          }
        } else {
          // @ts-ignore
          output[key] = srcVal;
        }
      });
    }
  }
  return output;
}


