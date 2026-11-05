import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { UpdateSalespersonUseCase } from './update-salesperson';
import { DomainEvents } from '@/core/events/domain-events';
import { SalespersonAlreadyExistsError } from './errors/salesperson-already-exists-error';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { FakeHasher } from 'tests/encryptography/fake-hasher';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';

let salespersonsRepo: InMemoSalespersonsRepo;
let fakeHasher: FakeHasher;
let sut: UpdateSalespersonUseCase;

describe('Update Salesperson', () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new UpdateSalespersonUseCase(salespersonsRepo);
    DomainEvents.clearHandlers();

    fakeHasher = new FakeHasher();
  });

  it('should be able to update a salesperson when the executor is a manager', async () => {
    const manager = makeSalesperson({
      email: 'manager@example.com',
      passwordHash: await fakeHasher.hash('123456'),
      role: SalespersonRole.manager, //! Ensure the role is 'manager'
    });
    const salesperson = makeSalesperson({
      email: 'salesperson@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    });

    salespersonsRepo.items.push(manager);
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: manager.role, // ! Ensure the executor is a manager
      salespersonID: salesperson.id.toString(),
      name: 'Salesperson Updated',
      email: 'salesperson@example.com',
      phone: '11988888888',
      role: SalespersonRole.salesperson,
    });

    expect(result.isRight()).toBe(true);
    expect(salespersonsRepo.items[1]).toEqual(
      expect.objectContaining({
        name: 'Salesperson Updated',
        email: 'salesperson@example.com',
      }),
    );
  });

  it('should not be able to update a non existing salesperson', async () => {
    const salesperson = makeSalesperson({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
      role: SalespersonRole.manager, //! Ensure the role is 'manager'
    });

    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: salesperson.role,
      salespersonID: 'non-existing-id', // ! Non-existing ID
      name: 'John Updated',
      email: 'johndoe@example.com',
      phone: '11988888888',
      role: SalespersonRole.salesperson,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it('should not be able to update a salesperson email to an already registered salesperson', async () => {
    const manager = makeSalesperson({
      email: 'manager@example.com',
      passwordHash: await fakeHasher.hash('123456'),
      role: SalespersonRole.manager, //! Ensure the role is 'manager'
    });
    const salesperson = makeSalesperson({
      email: 'salesperson@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    });

    salespersonsRepo.items.push(manager);
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: manager.role,
      salespersonID: salesperson.id.toString(),
      name: 'Salesperson Updated',
      email: 'manager@example.com', // !Trying to update to an email that already exists
      phone: '11988888888',
      role: SalespersonRole.salesperson,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonAlreadyExistsError);
  });

  it('should not be able to update a salesperson if not the executor is not a manager', async () => {
    const salesperson = makeSalesperson({
      email: 'salesperson@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    });
    const salesperson2 = makeSalesperson({
      email: 'salesperson2@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    });

    salespersonsRepo.items.push(salesperson);
    salespersonsRepo.items.push(salesperson2);

    const result = await sut.execute({
      executorRole: salesperson.role, //! Not a manager
      salespersonID: salesperson.id.toString(),
      name: 'Salesperson Updated',
      email: 'manager@example.com',
      phone: '11988888888',
      role: SalespersonRole.salesperson,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
