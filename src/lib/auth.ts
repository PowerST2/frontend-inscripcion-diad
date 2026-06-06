import { apiRequest } from "./api";

export const AUTH_TOKEN_KEY = "admision_auth_token";
export const AUTH_USER_KEY = "admision_auth_user";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type RegistrationStatus = {
  is_open?: boolean;
  message?: string;
  [key: string]: unknown;
};

export type AuthResponse = {
  status: "success";
  message: string;
  user: AuthUser;
  token: string;
  registration_status?: RegistrationStatus;
  active_schedule?: unknown;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
  password_confirmation: string;
};

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function profile(token: string) {
  return apiRequest<{ status: "success"; message: string; user: AuthUser }>("/auth/profile", {
    token,
  });
}

export function logout(token: string) {
  return apiRequest<{ status: "success"; message: string }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
    token,
  });
}
