import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import app from './firebaseConfig';

const auth = getAuth(app);
export let storedPhoneNumber = {countryCode:'',phoneNumber:''}; 
export const sendOtp = (countryCode,phoneNumber) => {
  const fullPhoneNumber = `+${countryCode}${phoneNumber}`;
  return new Promise((resolve, reject) => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => console.log('reCAPTCHA solved'),
        });
      }

      const appVerifier = window.recaptchaVerifier;
      signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult; // ✅ Ensure it's set
          storedPhoneNumber.countryCode=countryCode;
          storedPhoneNumber.phoneNumber=phoneNumber;
          resolve('OTP sent successfully!');
        })
        .catch((error) => {
          reject(error.message || 'Failed to send OTP.');
        });
    } catch (error) {
      reject(error.message || 'Unexpected error occurred.');
    }
  });
};
