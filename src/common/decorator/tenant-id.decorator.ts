import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest()
    return request.tenantId // Retrieve tenantId from the request object
  },
)
