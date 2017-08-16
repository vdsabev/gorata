const counters: Record<string, number> = {};
export const uniqueId = (prefix = '') => {
  if (counters[prefix] == null) {
    counters[prefix] = 0;
  }
  else {
    counters[prefix]++;
  }

  return `${prefix}${counters[prefix]}`;
};
