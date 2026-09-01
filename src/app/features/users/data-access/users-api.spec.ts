import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User } from '@core/models/user.model';
import { UsersApi } from './users-api';

describe('UsersApi', () => {
  let service: UsersApi;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    { id: '1', name: 'alice', email: 'alice@example.com', avatar: 'a.jpg' },
    { id: '2', name: 'bruno', email: 'bruno@example.com', avatar: 'b.jpg' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsersApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function flushUsers(users: User[] = mockUsers) {
    service.users();
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/users').flush(users);
    await Promise.resolve();
    TestBed.tick();
  }

  it('expone la lista de usuarios obtenida de la API', async () => {
    await flushUsers();

    expect(service.users()).toEqual(mockUsers);
  });

  it('devuelve un array vacío mientras no hay valor', () => {
    expect(service.users()).toEqual([]);
  });

  it('selecciona un usuario por id y expone su valor', async () => {
    await flushUsers([]);

    service.getUserById('2');
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/users/2').flush(mockUsers[1]);
    await Promise.resolve();
    TestBed.tick();

    expect(service.userById()).toEqual(mockUsers[1]);
  });

  it('limpia la selección del usuario actual', async () => {
    await flushUsers([]);

    service.getUserById('2');
    TestBed.tick();
    httpMock.expectOne('http://localhost:3000/users/2').flush(mockUsers[1]);
    await Promise.resolve();
    TestBed.tick();

    service.clearSelectedUser();

    expect(service.userById()).toBeUndefined();
  });
});
