import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { resetPasswordApi } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import PasswordInput from '../../custom/PasswordInput';

const ResetPassword = () => {
    const navigate=useNavigate()
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { 'reset-token': token } = useParams();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('This reset link is invalid. Please request a new one.');
            return;
        }

        if (!passwordRegex.test(password)) {
            toast.error(
                'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a special character.'
            );
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await resetPasswordApi({ password, token });
            if (response.success) {
                toast.success(response.message, { autoClose: 2000 })
                navigate('/login')
            } else {
                toast.error(response.message, { autoClose: 2000 })
            }
        } catch (err) {
            toast.error(err?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Reset Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            New Password:
                        </label>
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password:
                        </label>
                        <PasswordInput
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !token}
                        className={`w-full px-4 py-2 text-white font-semibold rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
