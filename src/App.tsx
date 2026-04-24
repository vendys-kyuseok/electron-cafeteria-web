import React from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';

const AuthLayout = React.lazy(() => import('@layouts/AuthLayout'));
const MainLayout = React.lazy(() => import('@layouts/MainLayout'));

const LoginPage = React.lazy(() => import('@pages/Login'));
const MenuPage = React.lazy(() => import('@pages/Menu'));
const UsagePage = React.lazy(() => import('@pages/Usage'));
const UpdatePage = React.lazy(() => import('@pages/Update'));
const LatestErrorPage = React.lazy(() => import('@pages/LatestError'));
const PaymentPage = React.lazy(() => import('@pages/Payment'));

function App() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route element={<Outlet />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route path="/*" element={<AuthLayout />}>
        <Route element={<MainLayout />}>
          <Route path="cafeteria/menu" element={<MenuPage />} /> {/* 메뉴 선택 화면 */}
          <Route path="cafeteria/usage" element={<UsagePage />} /> {/* 사용자별 결제 내역 */}
          <Route path="cafeteria/update" element={<UpdatePage />} /> {/* 최근 이슈 확인 */}
          <Route path="cafeteria/latestError" element={<LatestErrorPage />} /> {/* 최근 이슈 확인 */}
          <Route path="cafeteria/payment" element={<PaymentPage />} /> {/* 메뉴 결제 화면 */}
          {/* 잘못된 URL로 접근 시 메뉴 선택으로 보냄 */}
          <Route path="*" element={<Navigate to="/cafeteria/menu" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
