export const toArray = <T>(arrayLikeList: any): T[] => {
  const result: T[] = [];
  for (let index = 0; index < arrayLikeList.length; index++) {
    result.push(arrayLikeList[index]);
  }
  return result;
};
