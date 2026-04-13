/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { getLocalStorage } from '@utils/storageUtils';

const AuthLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!getLocalStorage('oauth')) {
      navigate('/login', { state: pathname });
    }
  }, [pathname]);

  return <Outlet />;
};

export default AuthLayout;
