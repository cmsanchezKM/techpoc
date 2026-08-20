export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password?: string; // Optional password field for authentication purposes
}
