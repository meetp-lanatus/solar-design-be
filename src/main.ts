import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { NestFactory, Reflector } from '@nestjs/core'
import { useContainer } from 'class-validator'

import { ResponseInterceptor } from './common/interceptor'
import { AppModule } from './modules/main/app.module'
import { APP_PORT, APP_ROUTE_PREFIX, VERSION_1 } from './constants'
import { setupSwagger } from './swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:5173'], // Replace with your frontend URLs
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies and authentication headers
  }

  app.enableCors(corsOptions)

  app.setGlobalPrefix(APP_ROUTE_PREFIX).enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_1],
  })

  setupSwagger(app)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  const AppReflector = app.get(Reflector)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(AppReflector),
    new ResponseInterceptor(AppReflector),
  )

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  await app.listen(APP_PORT)
}
bootstrap()
