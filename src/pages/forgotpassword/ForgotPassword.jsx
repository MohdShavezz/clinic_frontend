import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../services/api';

const ForgotPassword = () => {

  const emailRef = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault()
    const email = emailRef.current?.value.trim()
    if (!email) {
      setError('Enter email')
      return
    }
    if (!email.includes('@')) {
      setError('Invalid email')
      return
    }
    setError('')

    setLoading(true)
    try {
      const res = await forgotPassword(email)
      if (res.success) {
        toast.success(res.message, { autoClose: 2000 })
      } else {
        toast.error(res.message, { autoClose: 2000 })
      }
    } catch (error) {
      toast.error(error?.message || 'Unable to send the reset link. Please try again.', { autoClose: 4000 })
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Reset your password</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email Address</label>
            <div className="mt-2">
            <input ref={emailRef} id="email" name="email" type="email" placeholder="user@gmail.com" autoComplete="email"
                required className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" />
            </div>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <button
            disabled={loading}
            type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"> {loading ? "Sending..." : "Send"}</button>
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            New Member?
            <a className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer ml-1" onClick={() => navigate('/signup')}>SignUp</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
