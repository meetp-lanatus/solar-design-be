import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions, Repository } from 'typeorm'

import { CreateTenantDto } from './dto/create-tenant.dto'
import { Tenant } from './entities/tenant.entity'

@Injectable()
export class TenantService {
  private tenantRepository: Repository<Tenant>

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.tenantRepository = dataSource.getRepository(Tenant)
  }

  private async runMigrations(schemaName: string) {
    const tenantConfig = {
      ...this.dataSource.options,
      migrations: [__dirname + '/../../../migrations/tenanted/*.{ts,js}'],
      schema: schemaName,
    }

    const tenantDataSource = new DataSource(tenantConfig as DataSourceOptions)
    await tenantDataSource.initialize()
    await tenantDataSource.runMigrations()
    await tenantDataSource.destroy()
  }

  async createTenant(tenantDto: CreateTenantDto): Promise<Tenant> {
    let tenant = new Tenant()
    tenant.name = tenantDto.name
    tenant = await this.tenantRepository.save(tenant)

    const schemaName = `tenant_${tenant.id}`
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)

    // Run migrations for the new schema
    await this.runMigrations(schemaName)

    return tenant
  }

  async validateTenantId(tenantId: string): Promise<boolean> {
    const isTenantExists = await this.tenantRepository.exists({
      where: { id: +tenantId },
    })

    return isTenantExists
  }

  async findOne(tenantId: number) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    })

    return tenant
  }
}
