import React, {  useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { loginUser } from '../../app/features/userSlice';
import PasswordInput from '../../custom/PasswordInput';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state?.user);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handlePasswordChange = (e) => {
    setCredentials({ ...credentials, password: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
      const result = await dispatch(loginUser(credentials));
      if (loginUser.rejected.match(result)) {
        toast.error(result.payload || "Login failed. Please try again.");
        return;
      }
      if (loginUser.fulfilled.match(result)) {
        // toast.success(result.payload.message || "Login Successful!!!");
        navigate("/clinic");        
      }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign into your account</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email Address</label>
            <div className="mt-2">
              <input id="email" name="email" type="email" autoComplete="email" placeholder='user@gmail.com' onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
                required className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Password</label>
              <div className="text-sm">
                <Link to={'/forgot-password'} className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
              </div>
            </div>
            <PasswordInput
              value={credentials.password}
              onChange={handlePasswordChange}
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </div>
          <div>
           
            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">

              {loading ? "Signing..." : "Sign in" }
            </button>
          </div>
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            New Member?
            <Link className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer ml-1"
              to={'/signup'}>
              SignUp
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
