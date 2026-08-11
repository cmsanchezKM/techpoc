import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { User } from '@core/models/user.model';
import { API_BASE } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/users`;

  // Resource para obtener todos los usuarios
  private readonly allUsersResource = httpResource<User[]>(() => this.apiUrl);

  // Signal para rastrear el ID del usuario seleccionado
  private readonly selectedUserId = signal<string | undefined>(undefined);

  // Resource para obtener un usuario por ID
  private readonly userByIdResource = httpResource<User>(() => {
    const id = this.selectedUserId();
    return id ? `${this.apiUrl}/${id}` : undefined;
  });

  // Señales públicas reactivas
  readonly users: Signal<User[]> = computed(() => this.allUsersResource.value() ?? []);
  readonly usersLoading = this.allUsersResource.isLoading;
  readonly usersError = this.allUsersResource.error;

  readonly userById: Signal<User | undefined> = computed(() => this.userByIdResource.value());
  readonly userLoading = this.userByIdResource.isLoading;
  readonly userError = this.userByIdResource.error;

  /**
   * Obtiene la lista de todos los usuarios
   */
  getAllUsers(): Signal<User[]> {
    return this.users;
  }

  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario a obtener
   */
  getUserById(id: string): Signal<User | undefined> {
    this.selectedUserId.set(id);
    return this.userById;
  }

  /**
   * Limpia la selección del usuario actual
   */
  clearSelectedUser(): void {
    this.selectedUserId.set(undefined);
  }
}
