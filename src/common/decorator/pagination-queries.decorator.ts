import { applyDecorators } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'

export function PaginationQueries() {
  return applyDecorators(
    ApiQuery({
      name: '_offset',
      required: false,
      type: Number,
      description: 'Number of records to skip',
    }),
    ApiQuery({
      name: '_limit',
      required: false,
      type: Number,
      description: 'Number of records per page',
    }),
    ApiQuery({
      name: '_sort',
      required: false,
      type: String,
      description: 'Sorting field, e.g., "name"',
    }),
    ApiQuery({
      name: '_order',
      required: false,
      type: String,
      description: 'Sorting order field "asc" || "desc"',
    }),
    ApiQuery({
      name: '_search',
      required: false,
      type: String,
      description: `Search on multiple fields, e.g., "para" on name, title, and companyName`,
    }),
  )
}
