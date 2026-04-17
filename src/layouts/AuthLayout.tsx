/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { getAuthToken } from '@utils/storageUtils';

const AuthLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { state: pathname });
    }
  }, [pathname]);

  return <Outlet />;
};

export default AuthLayout;
