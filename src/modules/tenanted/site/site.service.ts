import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'

import { RoleEnum } from '@modules/public/user/entities/role.entity'
import { User } from '@modules/public/user/entities/user.entity'
import { CONNECTION } from '@modules/tenancy/tenancy.symbols'

import { CreateSiteDto } from './dto/create-site.dto'
import { UpdateSiteDto } from './dto/update-site.dto'
import { Site } from './entities/site.entity'

@Injectable()
export class SiteService {
  private siteRepository: Repository<Site>
  private userRepository: Repository<User>

  constructor(@Inject(CONNECTION) private connection: DataSource) {
    this.siteRepository = this.connection.getRepository(Site)
    this.userRepository = this.connection.getRepository(User)
  }

  async create(
    createSiteDto: CreateSiteDto,
    user: User,
    tenantId: string,
  ): Promise<Site> {
    let targetUser = user

    if (createSiteDto.customerId) {
      const userTenantRelation = user.userTenantRelation.find(
        (relation) => relation.tenant.id === Number(tenantId),
      )

      if (!userTenantRelation) {
        throw new ForbiddenException('You do not have access to this tenant')
      }

      const userRole = userTenantRelation.role.name
      const isAdminOrSuperAdmin =
        userRole.includes(RoleEnum.ADMIN) ||
        userRole.includes(RoleEnum.SUPER_ADMIN)

      if (!isAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'Only admin and super admin users can create sites for customers',
        )
      }

      const customer = await this.userRepository.findOne({
        where: { userId: createSiteDto.customerId },
        relations: ['userTenantRelation'],
      })

      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${createSiteDto.customerId} not found`,
        )
      }

      const currentUserTenantIds = user.userTenantRelation.map(
        (relation) => relation.tenant.id,
      )
      const customerTenantIds = customer.userTenantRelation.map(
        (relation) => relation.tenant.id,
      )

      const hasAccessToCustomer = currentUserTenantIds.some((tenantId) =>
        customerTenantIds.includes(tenantId),
      )

      if (!hasAccessToCustomer) {
        throw new BadRequestException(
          'You do not have permission to create sites for this customer',
        )
      }

      targetUser = customer
    }

    const { customerId, ...siteData } = createSiteDto
    const site = this.siteRepository.create({
      ...siteData,
      installationDate: new Date(createSiteDto.installationDate),
      user: targetUser,
    })

    return await this.siteRepository.save(site)
  }

  async findAll(user: User, tenantId: string): Promise<Site[]> {
    const userTenantRelation = user.userTenantRelation.find(
      (relation) => relation.tenant.id === Number(tenantId),
    )

    if (!userTenantRelation) {
      throw new ForbiddenException('You do not have access to this tenant')
    }

    const userRole = userTenantRelation.role.name
    const isAdminOrSuperAdmin =
      userRole.includes(RoleEnum.ADMIN) ||
      userRole.includes(RoleEnum.SUPER_ADMIN)

    if (isAdminOrSuperAdmin) {
      return await this.siteRepository.find({
        relations: ['user'],
      })
    } else {
      return await this.siteRepository.find({
        where: { user: { userId: user.userId } },
        relations: ['user'],
      })
    }
  }

  async findOne(id: string, user: User): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    })

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`)
    }

    return site
  }

  async update(
    id: string,
    updateSiteDto: UpdateSiteDto,
    user: User,
    tenantId: string,
  ): Promise<Site> {
    const site = await this.findOne(id, user)

    if (updateSiteDto.customerId) {
      const userTenantRelation = user.userTenantRelation.find(
        (relation) => relation.tenant.id === Number(tenantId),
      )

      if (!userTenantRelation) {
        throw new ForbiddenException('You do not have access to this tenant')
      }

      const userRole = userTenantRelation.role.name
      const isAdminOrSuperAdmin =
        userRole.includes(RoleEnum.ADMIN) ||
        userRole.includes(RoleEnum.SUPER_ADMIN)

      if (!isAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'Only admin and super admin users can reassign sites to customers',
        )
      }

      const customer = await this.userRepository.findOne({
        where: { userId: updateSiteDto.customerId },
        relations: ['userTenantRelation'],
      })

      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${updateSiteDto.customerId} not found`,
        )
      }

      const currentUserTenantIds = user.userTenantRelation.map(
        (relation) => relation.tenant.id,
      )
      const customerTenantIds = customer.userTenantRelation.map(
        (relation) => relation.tenant.id,
      )

      const hasAccessToCustomer = currentUserTenantIds.some((tenantId) =>
        customerTenantIds.includes(tenantId),
      )

      if (!hasAccessToCustomer) {
        throw new BadRequestException(
          'You do not have permission to reassign sites to this customer',
        )
      }

      site.user = customer
    }

    const { customerId, ...updateData } = updateSiteDto

    Object.assign(site, updateData)

    if (updateSiteDto.installationDate) {
      site.installationDate = new Date(updateSiteDto.installationDate)
    }

    return await this.siteRepository.save(site)
  }

  async remove(id: string, user: User): Promise<void> {
    const site = await this.findOne(id, user)
    await this.siteRepository.remove(site)
  }
}
