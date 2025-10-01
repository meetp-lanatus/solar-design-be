import { ValueTransformer } from 'typeorm'

import { Hash } from '../../utils/hash.util'

export class PasswordTransformer implements ValueTransformer {
  // Hash password when saving to database
  to(value: string) {
    if (value) {
      return Hash.make(value)
    }
    return null
  }

  // Get hashed password as is
  from(value: string) {
    return value
  }
}
