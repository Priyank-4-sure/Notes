import type { UserProfile } from "@/types";
import { API_URL } from "./config";

type AuthFetch = (url: string, options?: RequestInit) => Promise<Response>;

export async function fetchUserProfile(authFetch: AuthFetch): Promise<UserProfile> {
  const res = await authFetch(`${API_URL}/api/user/me/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user profile (Status: ${res.status})`);
  }
  return res.json();
}
