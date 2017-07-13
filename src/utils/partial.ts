export const partial = (fn: Function, ...partialArgs: any[]) => (...otherArgs: any[]) => fn(...partialArgs, ...otherArgs);
