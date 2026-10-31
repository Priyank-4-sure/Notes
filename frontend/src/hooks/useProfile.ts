import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchUserProfile } from "@/api/user";
import type { UserProfile } from "@/types";

export function useProfile() {
  const { authFetch, isLoggedIn } = useAuth();

  return useQuery<UserProfile, Error>({
    queryKey: ["profile"],
    queryFn: () => fetchUserProfile(authFetch),
    enabled: isLoggedIn,
    staleTime: 60 * 1000,
  });
}
