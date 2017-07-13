import 'jest';

import { guid } from './guid';

describe(`guid`, () => {
  it(`should return a different value for every call`, () => {
    expect(guid()).not.toBe(guid());
  });

  it(`should only contain dashes and hexadecimal characters`, () => {
    expect(guid().match(/[^-0-9abcdef]/g)).toBe(null);
  });

  it(`should have 5 parts separated by 4 dashes`, () => {
    expect(guid().split('-').length).toBe(5);
  });

  it(`should return 32 characters`, () => {
    expect(guid().replace(/-/g, '').length).toBe(32);
  });
});
