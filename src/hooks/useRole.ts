import { useEffect, useState } from "react";

// Returns null while loading, "admin" or "viewer" after reading sessionStorage.
// Defaults to hiding edit UI until role is confirmed (safe for viewers).
export function useRole(): "admin" | "viewer" | null {
  const [role, setRole] = useState<"admin" | "viewer" | null>(null);
  useEffect(() => {
    const r = sessionStorage.getItem("acampa_role");
    setRole(r === "viewer" ? "viewer" : "admin");
  }, []);
  return role;
}
