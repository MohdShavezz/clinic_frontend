import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { signUp } from "../../services/api";
import PasswordInput from "../../custom/PasswordInput";

const disposableEmails = [
  "mailinator.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
];
const SignUp = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const [errors, setErrors] = useState({});

  // Form Validation
  const validate = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!form.fullname.trim()) newErrors.fullname = "Fullname is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    // else if (disposableEmails.includes(form.email.split('@')[1])) newErrors.email = "Disposable email address not allowed";
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, and one special character";
    }

    if (!form.cpassword) newErrors.cpassword = "Confirm password is required";
    else if (form.password !== form.cpassword) newErrors.cpassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true); // Start loading state
    try {
      const result = await signUp({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
      });

      setLoading(false); // End loading state

      if (result.success) {
        toast.success(result.message || "Registration Successful!", { autoClose: 3000 });

        // Reset the form
        setForm({
          fullname: "",
          email: "",
          password: "",
          cpassword: "",
        });

      } else {
        toast.error(result.message || "Signup failed! Please try again.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "Signup failed! Please try again.");
      console.error("Signup Error:", error);
    }
  };

  // Handle Input Changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear individual field error
  };


  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-8 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-3">
        <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign up your account
        </h2>
      </div>

      <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <>
            <div>
              <label htmlFor="fullname" className="block text-sm/6 font-medium text-gray-900">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={form.fullname}
                  placeholder="username"
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                />
                {errors.fullname && <p className="text-red-500 text-xs">{errors.fullname}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email Address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@gmail.com"
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <PasswordInput
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="********"
                  autoComplete="current-password"

                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="cpassword" className="block text-sm/6 font-medium text-gray-900">
                Confirm Password
              </label>
              <div className="mt-2">
                <PasswordInput
                  id="cpassword"
                  name="cpassword"
                  value={form.cpassword}
                  onChange={handleChange}
                  placeholder="********"

                />
                {errors.cpassword && <p className="text-red-500 text-xs">{errors.cpassword}</p>}
              </div>
            </div>
          </>
          <div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 p-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loading ? "Signing.." : "Sign Up"}
            </button>
          </div>
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
