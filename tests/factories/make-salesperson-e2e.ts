/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { PrismaService } from '@/infra/db/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SalespersonRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';

@Injectable()
export class SalespersonFactoryE2E {
  constructor(private prisma: PrismaService) {}

  async makePrismaSalesperson(override: any = {}) {
    return this.prisma.salesperson.create({
      data: {
        id: randomUUID(),
        name: 'John Doe',
        email: `johndoe-${randomUUID()}@example.com`,
        password: 'password-hash',
        phone: '123456789',
        role: SalespersonRole.salesperson,
        ...override,
      },
    });
  }
}
