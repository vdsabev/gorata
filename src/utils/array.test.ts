import 'jest';

import { toArray } from './array';

describe(`toArray`, () => {
  it(`should convert array-like object into array`, () => {
    expect(toArray({ 0: 'a', 1: 'b', 2: 'c', length: 3 })).toEqual(['a', 'b', 'c']);
  });

  it(`should return empty array if no length`, () => {
    expect(toArray({ 0: 'a', 1: 'b', 2: 'c' })).toEqual([]);
  });
});
