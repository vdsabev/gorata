import * as $script from 'scriptjs';

export const loadScript = (url: string) => new Promise((resolve, reject) => $script(url, resolve));
