const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const AUTH_ROUTES = {
  REGISTER: `${BASE_URL}/user/register`,
  LOGIN: `${BASE_URL}/user/login`,
  PHONE_LOGIN: `${BASE_URL}/user/phone-login`,
  LOGOUT: `${BASE_URL}/user/logout`,
  UPDATE_PROFILE: `${BASE_URL}/user/update-profile`,
  FORGOT_PASSWORD: `${BASE_URL}/user/forgot-password`,
  RESET_PASSWORD: (token) => `${BASE_URL}/user/reset-password/${encodeURIComponent(token)}`,
  CHANGE_PASSWORD: `${BASE_URL}/user/change-password`,
  SEND_EMAIL_OTP: `${BASE_URL}/user/send-email-otp`,
  VERIFY_EMAIL_OTP: `${BASE_URL}/user/verify-email-otp`
};
