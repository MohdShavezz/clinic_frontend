import { getAuth } from "firebase/auth";
import app from './firebaseConfig.js'; // Ensure Firebase app is initialized
import { storedPhoneNumber } from "./sendOtp.js";

const auth = getAuth(app);

export const verifyOtp = (otp) => {
  return new Promise((resolve, reject) => {
    if (!window.confirmationResult) {
      reject('OTP verification process was not initialized. Please request a new OTP.');
      return;
    }

    // Handle test OTP
    if (otp === '123456') {
      if (!storedPhoneNumber.phoneNumber || !storedPhoneNumber.countryCode) {
        reject('Phone number not found. Please request a new OTP.');
        return;
      }
      resolve( { phoneNumber: storedPhoneNumber.phoneNumber, countryCode:storedPhoneNumber.countryCode }); // Use the stored phone number
      return;
    }

    // Handle real OTP
    window.confirmationResult.confirm(otp)
      .then((result) => {
        resolve(result.user);
      })
      .catch((error) => {
        reject(error.message || 'Invalid OTP. Please try again.');
      });
  });
};