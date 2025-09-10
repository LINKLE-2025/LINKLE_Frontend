import { jwtDecode } from "jwt-decode";

export function getTokenExpiration(token: string): number {
  const { exp } = jwtDecode<{ exp: number }>(token);
  return exp * 1000;
}
