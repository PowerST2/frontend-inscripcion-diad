import { apiRequest } from "./api";

export const AUTH_TOKEN_KEY = "admision_auth_token";
export const AUTH_USER_KEY = "admision_auth_user";

export type AuthUser = {
  id: number;
  name: string;
  paternal_surname?: string | null;
  maternal_surname?: string | null;
  names?: string | null;
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
  paternal_surname: string;
  maternal_surname: string;
  names: string;
  password_confirmation: string;
};

export function getStoredAuthToken() {
  const sessionToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (sessionToken) {
    return sessionToken;
  }

  const legacyToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (legacyToken) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  return legacyToken;
}

export function getStoredAuthUser() {
  const storedUser = sessionStorage.getItem(AUTH_USER_KEY) ?? localStorage.getItem(AUTH_USER_KEY);
  try {
    const user = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
    if (user) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.removeItem(AUTH_USER_KEY);
    }

    return user;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function persistAuthSession(response: AuthResponse) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, response.token);
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

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
