import api from '../config/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types';

const TOKEN_KEY = 'miniverse_token';
const USERNAME_KEY = 'miniverse_username';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const authData = response.data;
    
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USERNAME_KEY, authData.username);
    
    return authData;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    const authData = response.data;
    
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USERNAME_KEY, authData.username);
    
    return authData;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders() {
    const token = this.getToken();
    console.log(token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();