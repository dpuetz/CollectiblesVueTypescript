import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/models/user';
import type { DefaultUser } from '@/models/userDefault';
import type { LoginRequest } from '@/models/loginRequest';
import { loginUserApi } from '@/api/userApi';

export const useUserStore = defineStore('user', () => {
  //state
  const currentUser = ref<User | null>(null);
  const token = ref<string | null>(null);
  const defaultUsers: DefaultUser[] = [
    {
      email: 'Pat@pats.com',
      password: 'koDit$Cat@',
      role: 'admin',
    },
    {
      email: 'Jam@Jamalot.com',
      password: 'koDit$Dog@',
      role: 'guest',
    },
  ];

  // Initialize from localStorage on store creation
  const initUser = (): void => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      try {
        currentUser.value = JSON.parse(storedUser);
        token.value = storedToken;
      } catch {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
  };

  initUser(); // Call on store initialization

  //getters
  const isLoggedIn = computed<boolean>(() => {
    return currentUser.value ? true : false;
  });
  const groups = computed<string[]>(() => currentUser.value?.groups ?? []);

  //actions
  const login = async (loginRequest: LoginRequest): Promise<string> => {
    const [error, data] = await loginUserApi(loginRequest);
    if (error || !data) {
      return error || 'Login failed';
    }

    currentUser.value = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      groups: data.groups,
    };
    token.value = data.token;
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value));
    localStorage.setItem('token', data.token);

    return '';
  };

  const logout = (): void => {
    currentUser.value = null;
    token.value = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return {
    currentUser,
    defaultUsers,
    token,
    groups,
    isLoggedIn,
    login,
    logout,
  };
});
