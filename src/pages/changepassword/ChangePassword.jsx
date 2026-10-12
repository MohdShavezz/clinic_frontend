import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { changePasswordApi, forgotPassword } from '../../services/api';
import { toast } from 'react-toastify';
import PasswordInput from '../../custom/PasswordInput';
import { useSelector } from 'react-redux';

const ChangePassword = () => {
  const { token } = useSelector((state) => state.user);
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate()

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on input change
  };

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
  
    // Old Password: Only check for required
    if (!form.oldPassword) {
      newErrors.oldPassword = "Password is required.";
    }
  
    // New Password: Enhanced validation
    if (!form.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (!passwordRegex.test(form.newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, and one special character.";
    }
  
    return newErrors;
  };
  

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    setLoading(true);
    try {
      // Call the API utility function
      const response = await changePasswordApi({
        currentPassword: form.oldPassword,
        newPassword: form.newPassword,
        token
      });
  console.log(response)
      toast.success(response.message,{autoClose:2000})
      setForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      console.log('erro in change password: ',error)
      toast.error(error.message,{autoClose:2000})
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Change your password</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-5">
        <div>
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <PasswordInput
                  name="oldPassword"
                  value={form.oldPassword}
                  onChange={handleChange}
                  placeholder="********"
                />
                {errors.oldPassword && <p className="text-red-500 text-xs">{errors.oldPassword}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="cpassword" className="block text-sm/6 font-medium text-gray-900">
                New Password
              </label>
              <div className="mt-2">
                <PasswordInput
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="********"
                />
                {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword}</p>}
              </div>
            </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            type="button" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"> {loading ? "Sending..." : "Send"}</button>
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            New Member?
            <a className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer ml-1" onClick={() => navigate('/signup')}>SignUp</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
