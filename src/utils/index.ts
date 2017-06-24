import * as $script from 'scriptjs';

export const loadScript = (url: string) => new Promise((resolve, reject) => $script(url, resolve));

// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export const guid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8); // tslint:disable-line
    return v.toString(16);
  });
};

export const toArray = <T>(arrayLikeList: any): T[] => {
  const result: T[] = [];
  for (let index = 0; index < arrayLikeList.length; index++) {
    result.push(arrayLikeList[index]);
  }
  return result;
};
