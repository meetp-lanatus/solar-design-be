import ms, { StringValue } from 'ms'

export function convertTimeInSeconds(value: any): number {
  const timeInMiliSeconds = ms(value as StringValue)
  const timeInSeconds = timeInMiliSeconds / 1000
  return timeInSeconds
}

export type TimeStringValue = StringValue
