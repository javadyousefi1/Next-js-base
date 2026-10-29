/**
 * Upstream API paths (relative to `API_BASE_URL` on the server, or to `/api/proxy` in the
 * browser — the BFF forwards the same path). Never inline an endpoint string elsewhere.
 */
export const API_ENDPOINTS = {
  auth: {
    login: "/Authentication/Login",
    register: "/Authentication/Register",
    verifyOtp: "/Authentication/VerifyOtp",
    resendOtp: "/Authentication/ResendOtp",
    registerByInviteLink: "/Authentication/RegisterByInviteLink",
  },
  users: { me: "/User/Get", list: "/User/GetAll" },
} as const;
