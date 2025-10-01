export enum BooleanValue {
  true = 'true',
  false = 'false',
}

export const getBooleanFromValue = (bool: string): boolean => {
  return bool.toLowerCase() === BooleanValue.true ? true : false
}
