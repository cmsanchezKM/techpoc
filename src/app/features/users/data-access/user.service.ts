import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject, Signal, computed } from '@angular/core';
import { User } from '@core/models/user.model';
import { API_BASE } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  private readonly usersResource = httpResource<User[]>(() => `${API_BASE}/users`);

  readonly allUsers: Signal<User[]> = computed(() => this.usersResource.value() ?? []);
  readonly isLoading = this.usersResource.isLoading;
  readonly error = this.usersResource.error;

  getUserById(id: string): User | undefined {
    return this.allUsers().find((u) => u.id === id);
  }
}
