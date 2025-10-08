import { Injectable, NestMiddleware } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req
    const timestamp = new Date().toISOString()

    this.logger.log(`[${timestamp}] [Request] ${method} ${originalUrl}`)

    res.on('finish', () => {
      const statusCode = res.statusCode
      this.logger.log(
        `[${timestamp}] [Response] ${method} ${originalUrl} ${statusCode}`,
      )
    })

    next()
  }
}
