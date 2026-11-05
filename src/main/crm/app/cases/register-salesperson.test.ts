import { DomainEvents } from '@/core/events/domain-events';
import { RegisterSalespersonUseCase } from './register-salesperson';
import { FakeHasher } from 'tests/encryptography/fake-hasher';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { SalespersonAlreadyExistsError } from './errors/salesperson-already-exists-error';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';

let salespersonsRepo: InMemoSalespersonsRepo;
let fakeHasher: FakeHasher;
let sut: RegisterSalespersonUseCase;

describe('Register Salesperson', () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    fakeHasher = new FakeHasher();
    sut = new RegisterSalespersonUseCase(salespersonsRepo, fakeHasher);
    DomainEvents.clearHandlers();
  });

  it('should be able to register a salesperson if the executor is manager', async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    await salespersonsRepo.create(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '11999999999',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
    expect(salespersonsRepo.items[1]).toEqual(
      expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
      }),
    );
  });

  it('should not be able to register a new salesperson with an existing email', async () => {
    const manager = makeSalesperson({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
      role: SalespersonRole.manager,
    });
    await salespersonsRepo.create(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '11999999999',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonAlreadyExistsError);
    expect(salespersonsRepo.items).toHaveLength(1);
  });

  it('should not be able to register a salesperson if the executor is not a manager', async () => {
    const salesperson = makeSalesperson({ role: SalespersonRole.salesperson });
    await salespersonsRepo.create(salesperson);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '11999999999',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should not be able to register a new salesperson without an existing executorID', async () => {
    const result = await sut.execute({
      executorID: 'non-existing-executor-id',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '11999999999',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });
});
