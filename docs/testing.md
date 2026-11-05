# Testing

## Unit tests

```bash
pnpm test
pnpm test:watch
```

- Files: `src/**/*.test.ts`, colocated with each use case.
- Each use case runs against **in-memory repositories** (`tests/repos`), **fake cryptography** (`tests/encryptography`) and **Faker factories** (`tests/factories/make-*.ts`). No database or mocking framework.
- Assertions use `Either`: `result.isRight()` for success, `result.isLeft()` plus `instanceof` on the error for failures.
- Test names describe business rules, so they double as living documentation.

```ts
const manager = makeSalesperson({ role: SalespersonRole.manager });
const result = await sut.execute({ executorRole: manager.role, page: 1 });

expect(result.isRight()).toBe(true);
```

## End-to-end tests

```bash
pnpm test:e2e
pnpm test:e2e:watch
```

- Files: `src/**/*.e2e.ts`, next to each controller; config in `vitest.config.e2e.ts`.
- They need a running PostgreSQL and a valid `DATABASE_URL` (see `.env.example`).
- `tests/setup-e2e.ts` creates an **isolated schema** per run (`e2e_<uuid>`), runs `prisma migrate deploy` against it and drops it in `afterAll`, so runs never touch your development data.
- `tests/factories/make-*-e2e.ts` persist data through Prisma for test setup.
- Requests are sent with Supertest against a Nest application created with `@nestjs/testing`.

## Conventions

- Import through the `@/` alias.
- Every new use case ships with a unit test; every new endpoint ships with an e2e test.
- Run `pnpm lint` before committing.
