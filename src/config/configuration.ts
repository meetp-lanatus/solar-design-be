import { convertTimeInSeconds } from '@app/utils/timeUtils'

import { getBooleanFromValue } from './types'

export default () => ({
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: getBooleanFromValue(process.env.DB_SSL || 'false'),
  },
  token: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiration: convertTimeInSeconds(process.env.ACCESS_TOKEN_EXPIRATION),
    refresh: {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiration: convertTimeInSeconds(process.env.REFRESH_TOKEN_EXPIRATION),
    },
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
    redirectURL: process.env.GOOGLE_REDIRECT_URL,
  },
})
