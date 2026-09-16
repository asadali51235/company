export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Navigate to the independent credentials login page.
export const startLogin = () => {
  if (typeof window !== "undefined") window.location.href = "/login";
};
