import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function PublicRoute() {
  const { token } = useSelector((state) => state.user);
  // If the user is already authenticated, redirect to the home page or profile
  return !token ? <Outlet /> : <Navigate to="/profile" />;
}
