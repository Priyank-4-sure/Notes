import type { Dispatch, SetStateAction } from 'react';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthContextType {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
  refreshToken: string | null;
  setRefreshToken: Dispatch<SetStateAction<string | null>>;
  refreshAccessToken: () => Promise<string | null>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password1: string;
  password2: string;
}
