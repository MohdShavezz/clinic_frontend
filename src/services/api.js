import { AUTH_ROUTES } from "../api_routes/authRoutes";
import { CALL } from "../utils/CALL";

export const signUp = (userData) => CALL({ method: "POST", url: AUTH_ROUTES.REGISTER, data: userData });

export const logIn = (credentials) => CALL({ method: "POST", url: AUTH_ROUTES.LOGIN, data: credentials });
export const phoneLoginApi = (credentials) => CALL({ method: "POST", url: AUTH_ROUTES.PHONE_LOGIN, data: credentials });

export const logOut = (token) => CALL({ method: "POST", url: AUTH_ROUTES.LOGOUT, token });

export const updateProfile = (formData, token) => CALL({ method: "PUT", url: AUTH_ROUTES.UPDATE_PROFILE, data: formData, token, isFormData: true });

export const forgotPassword = (email) => CALL({ method: "POST", url: AUTH_ROUTES.FORGOT_PASSWORD, data: { email } });

export const resetPasswordApi = ({ password, token }) => CALL({ method: "POST", url: AUTH_ROUTES.RESET_PASSWORD(token), data: { newPassword: password, resetToken: token } });

export const changePasswordApi = ({ currentPassword, newPassword, token }) => CALL({ method: "POST", url: AUTH_ROUTES.CHANGE_PASSWORD, data: { currentPassword, newPassword }, token });

export const sendEmailOtpApi = (email) => CALL({ method: "POST", url: AUTH_ROUTES.SEND_EMAIL_OTP, data: { email } });

export const verifyEmailApi = (email, otp) => CALL({ method: "POST", url: AUTH_ROUTES.VERIFY_EMAIL_OTP, data: { email, otp } });

