import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'

import { CACHE_PREFIX_USER } from '@app/constants'
import {
  FilterParam,
  PaginationParam,
  SortParam,
} from '@app/utils/query-param.util'

import { CacheService } from '@modules/cache/cache.service'
import { Action } from '@modules/casl/action.enum'
import { CaslAbilityFactory } from '@modules/casl/casl-ability.factory'
import { SignupDto } from '@modules/public/auth/dto/signup.dto'
import { TenantService } from '@modules/public/tenant/tenant.service'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Role, RoleEnum } from './entities/role.entity'
import { User } from './entities/user.entity'
import { UserTenantRelation } from './entities/user-tenant-relation.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserTenantRelation)
    private readonly userTenantRelationRepository: Repository<UserTenantRelation>,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly tenantService: TenantService,
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUpUser(signupDto: SignupDto) {
    const user = await this.findByEmail(signupDto.email)

    if (user) {
      throw new ConflictException(
        'A user with the provided email already exists.',
      )
    }

    const userRole = await this.findRoleByName(RoleEnum.USER)
    const userTenant = await this.tenantService.findOne(signupDto.tenantId)

    const newUserSchema = this.userRepository.create({
      ...signupDto,
    })
    const newUser = await this.userRepository.save(newUserSchema)

    const newUserRelationSchema = this.userTenantRelationRepository.create({
      role: userRole,
      tenant: userTenant,
      user: newUser,
    })
    await this.userTenantRelationRepository.save(newUserRelationSchema)

    return await this.findOne(newUser.userId)
  }

  async sendPasswordSetEmail(
    token: string,
    sendTo: { email: string; name: string },
  ): Promise<any> {
    const domainUrl = this.configService.get<string>('email.redirectUrl')
    const brevoApiKey = this.configService.get<string>('brevo.apiKey')

    const resetPasswordUrl = `${domainUrl}?token=${token}&email=${sendTo.email}`

    const emailPayload = {
      sender: {
        name: 'Medicine Wholesaler',
        email: 'medicinewholesaler0@gmail.com',
      },
      to: [sendTo],
      subject: 'Password Set Request',
      htmlContent: `
        <html>
          <head></head>
          <body>
            <p>Hello,</p>
            <p>You are receiving this email because an account has been created for you on Wholesale Pharma. To complete the setup, you need to set your password.</p>
            <p>Please click the link below to set your password:</p>
            <p><a href="${resetPasswordUrl}">Set Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>Medicine Wholesaler</p>
          </body>
        </html>
      `,
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })
      const res = await response.json()

      return 'Email sent.'
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send password reset email')
    }
  }

  async create(
    createDto: CreateUserDto,
    currentUser: User,
    currentUserTenantId: string,
  ) {
    const isUserExists = await this.findByEmail(createDto.email)

    if (isUserExists) {
      throw new ConflictException(
        'A user with the provided email already exists.',
      )
    }

    const userRole = await this.findRoleByName(createDto.roleName)
    const userTenant = await this.tenantService.findOne(createDto.tenantId)

    const userTenantRelationSchema = this.userTenantRelationRepository.create({
      role: userRole,
      tenant: userTenant,
    })

    const newUserSchema = this.userRepository.create({
      ...createDto,
    })

    const currentUserAbility = this.caslAbilityFactory.createForUser(
      currentUser,
      currentUserTenantId,
    )
    const res = currentUserAbility.can(Action.Create, userTenantRelationSchema)

    if (!res) {
      throw new ForbiddenException()
    }

    const newUser = await this.userRepository.save(newUserSchema)

    await this.userTenantRelationRepository.save({
      ...userTenantRelationSchema,
      user: newUser,
    })

    const accessToken = this.jwtService.sign({
      sub: newUser.userId,
      email: newUser.email,
    })

    await this.sendPasswordSetEmail(accessToken, {
      email: newUser.email,
      name: newUser.firstName,
    })

    return await this.findOne(newUser.userId)
  }

  async findAll(
    paginationParam: PaginationParam,
    sortParams: SortParam[],
    filterParams: FilterParam[],
  ): Promise<{ users: User[]; totalCount: number }> {
    const query: SelectQueryBuilder<User> = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.userTenantRelation', 'userTenantRelation')
      .leftJoinAndSelect('userTenantRelation.role', 'role') // Ensure role is included if filtering
      .leftJoinAndSelect('userTenantRelation.tenant', 'tenant')

    for (const filterParam of filterParams) {
      if (filterParam.fieldName === '_search' && filterParam.value) {
        // use raw SQL for where clause
        query.andWhere(
          `users.first_name ilike :search OR users.last_name ilike :search OR users.email ilike :search`,
          {
            search: `%${filterParam.value}%`,
          },
        )
      }
      if (filterParam.fieldName === 'nonSuperUser') {
        query.andWhere('role.name != :role', {
          role: RoleEnum.SUPER_ADMIN,
        })
      }
      if (filterParam.fieldName === 'tenantId') {
        query.andWhere('tenant.id = :tenantId', {
          tenantId: filterParam.value,
        })
      }
      if (filterParam.fieldName === 'filterMe') {
        query.andWhere('users.user_id != :userId', {
          userId: filterParam.value,
        })
      }
    }

    const totalCount = await query.getCount()

    for (const sortParam of sortParams) {
      if (sortParam.fieldName === 'email') {
        query.addOrderBy('users.email', sortParam.order)
      }
      if (sortParam.fieldName === 'firstName') {
        query.addOrderBy('users.firstName', sortParam.order)
      }
      if (sortParam.fieldName === 'lastName') {
        query.addOrderBy('users.lastName', sortParam.order)
      }
    }

    query.offset(paginationParam.offset).limit(paginationParam.limit)

    const users = await query.getMany()

    return { users, totalCount }
  }

  async filterNonSuperAdminUsersFindAll(
    paginationParam: PaginationParam,
    sortParams: SortParam[],
    filterParams: FilterParam[],
    currentUserTenantId: string,
    currentUserRoleName: RoleEnum,
    currentUserRelation: ICurrentUserRelation,
  ): Promise<{ users: User[]; totalCount: number }> {
    // default filter
    filterParams = [
      ...filterParams,
      {
        fieldName: 'tenantId',
        value: currentUserTenantId,
      },
      {
        fieldName: 'filterMe',
        value: currentUserRelation.userId,
      },
    ]

    // restrict super-admin user for non-super-admin user
    if ([RoleEnum.USER, RoleEnum.ADMIN].includes(currentUserRoleName)) {
      filterParams = [
        ...filterParams,
        {
          fieldName: 'nonSuperUser',
          value: 'true',
        },
      ]
    }

    const { users, totalCount } = await this.findAll(
      paginationParam,
      sortParams,
      filterParams,
    )

    return { users, totalCount }
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOne({
      where: { userId },
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async validateUserAndFindOne(
    userId: string,
    currentUser: User,
    currentUserTenantId: string,
  ) {
    const currentUserAbility = this.caslAbilityFactory.createForUser(
      currentUser,
      currentUserTenantId,
    )
    const findUser = new User()
    findUser.userId = userId
    const res = currentUserAbility.can(Action.Read, findUser)

    if (!res) {
      throw new ForbiddenException()
    }

    return await this.findOne(userId)
  }

  async findByEmail(email: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .where('users.email = :email')
      .setParameter('email', email)
      .getOne()
  }

  async update(
    userId: string,
    updateDto: UpdateUserDto,
    currentUser: User,
    currentUserTenantId: string,
    currentUserRelation: ICurrentUserRelation,
  ): Promise<User> {
    const currentUserAbility = this.caslAbilityFactory.createForUser(
      currentUser,
      currentUserTenantId,
    )

    // Retrieve the user to be updated
    const user = await this.findOne(userId)
    const userRelationToUpdate = user.userTenantRelation.filter(
      (relation) => relation.tenant.id === Number(currentUserTenantId),
    )[0]

    if (updateDto?.roleName) {
      const updateRole = await this.findRoleByName(updateDto.roleName)
      userRelationToUpdate.role = updateRole
      const res = currentUserAbility.can(Action.Update, userRelationToUpdate)

      if (!res) {
        throw new ForbiddenException()
      }
    }

    const updateUserSchema = this.userRepository.create({
      ...user,
      ...updateDto,
    })
    const res = currentUserAbility.can(Action.Update, updateUserSchema)

    if (!res) {
      throw new ForbiddenException()
    }

    await this.cacheService.deleteByKey(CACHE_PREFIX_USER + userId)

    const updatedUser = await this.userRepository.save(updateUserSchema)

    await this.userTenantRelationRepository.save({
      ...userRelationToUpdate,
    })

    return await this.findOne(updatedUser.userId)
  }

  async remove(userId: string, currentUser: User, currentUserTenantId: string) {
    // retrive user to be deleted
    const user = await this.findOne(userId)

    const currentUserAbility = this.caslAbilityFactory.createForUser(
      currentUser,
      currentUserTenantId,
    )
    const res = currentUserAbility.can(Action.Delete, user)

    if (!res) {
      throw new ForbiddenException()
    }

    const result = await this.userRepository.delete(userId)

    if (result.affected) {
      await this.cacheService.deleteByKey(CACHE_PREFIX_USER + userId)
      return 'User deleted successfully.'
    }

    return 'Failed to delete user.'
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return await this.userRepository.update(userId, {
      refreshToken,
    })
  }

  async deleteRefreshToken(userId: string) {
    return await this.userRepository.manager.connection
      .query(`UPDATE users SET refresh_token = NULL WHERE userId = $1`, [
        userId,
      ])
      .catch((e) => console.log(e))
  }

  async findRoleByName(name: RoleEnum) {
    return await this.roleRepository.findOne({
      where: { name },
    })
  }

  async getUserTenantRelation(userId: string, tenantId: string) {
    return await this.userTenantRelationRepository.findOne({
      where: {
        user: { userId },
        tenant: { id: Number(tenantId) },
      },
      relations: {
        user: true,
        tenant: true,
      },
    })
  }

  async updateUserPassword(userId: string, newPassword: string) {
    const user = await this.findOne(userId)

    const res = await this.userRepository.update(
      { userId },
      {
        password: newPassword,
        refreshToken: null,
      },
    )

    if (!res.affected) {
      throw new Error('Unable to update password.')
    }

    return await this.findOne(userId)
  }
}
