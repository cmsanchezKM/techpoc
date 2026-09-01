import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User } from '@core/models/user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    { id: '1', name: 'alice', email: 'alice@example.com', avatar: 'a.jpg' },
    { id: '2', name: 'bruno', email: 'bruno@example.com', avatar: 'b.jpg' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function flushUsers(users: User[] = mockUsers) {
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/users').flush(users);
    await Promise.resolve();
    TestBed.tick();
  }

  it('devuelve un array vacío mientras no hay valor', () => {
    expect(service.allUsers()).toEqual([]);
  });

  it('expone la lista de usuarios obtenida de la API', async () => {
    await flushUsers();

    expect(service.allUsers()).toEqual(mockUsers);
  });

  it('busca un usuario por id entre los ya cargados', async () => {
    await flushUsers();

    expect(service.getUserById('2')).toEqual(mockUsers[1]);
  });

  it('devuelve undefined si el id no existe entre los usuarios cargados', async () => {
    await flushUsers();

    expect(service.getUserById('999')).toBeUndefined();
  });
});
