/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useMatch } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, useCafeteriaMe } from '@hooks/auth';
import { useElectronStatusCheck } from '@hooks/cafeteria';
import { useElectron } from '@hooks/electron';
import { Box } from '@mui/material';
import { version } from '@package';
import { FlexBoxCenter } from '@styles';
import { getLocalStorage } from '@utils/storageUtils';

import VendysIcon from '@assets/ic_vendys.svg?react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuIcon from '@mui/icons-material/Menu';
import SdCardAlertIcon from '@mui/icons-material/SdCardAlert';

// Styled Component
import { NavContainer, NavHeader, NavFooter, MotionDivContainer, LogoutButton, ExitButton, NavToggleButton, DimOverlay } from './styles';
import { MenuToggle } from '@components';

const DEFAULT_TRANSITION = { duration: 0.2 };
const DEFAULT_VARIANTS = {
  open: { opacity: 1, transition: DEFAULT_TRANSITION },
  closed: { opacity: 0, transition: DEFAULT_TRANSITION }
};
const FADE_VARIANTS = {
  open: { ...DEFAULT_VARIANTS.open, display: 'block' },
  closed: { ...DEFAULT_VARIANTS.closed, transitionEnd: { display: 'none' } }
};
const DIM_VARIANTS = {
  open: { ...FADE_VARIANTS.open, opacity: 0.4 },
  closed: { ...DEFAULT_VARIANTS.closed, transitionEnd: { display: 'none' } }
};

const MENU_LIST = [
  { path: '/cafeteria/menu', label: '메뉴 관리', icon: <MenuBookIcon /> },
  { path: '/cafeteria/usage', label: '사용 내역', icon: <ListAltIcon /> },
  { path: '/cafeteria/latestError', label: '최근 에러 관리', icon: <SdCardAlertIcon /> }
];

const MainLayout = () => {
  const location = useLocation();
  const electron = useElectron(); // Electron Custom Hook
  const isMatched = useMatch('/cafeteria/payment');
  const { data } = useCafeteriaMe(); // 사용자 정보 조회
  const { logout: handleCafeteriaLogout } = useAuth();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const userInfo = data || getLocalStorage('cafeteria');
  const userId = getLocalStorage('userId');

  const { isFocusIn, isOnLine } = useElectronStatusCheck();

  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.focus();
  }, [location.pathname, isExpanded]);

  const handleElectronClose = () => electron.send('electron-close');

  const header = MENU_LIST.find(({ path }) => path === location.pathname)?.label;
  const expansionState = isExpanded ? 'open' : 'closed';
  return (
    <Box sx={{ display: 'flex', height: `100vh`, boxSizing: 'border-box', border: '8px solid #252525', borderLeft: 'none' }}>
      <Box sx={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        <MotionDivContainer animate={{ width: isExpanded ? 320 : 80 }} transition={DEFAULT_TRANSITION}>
          <NavToggleButton onClick={() => setIsExpanded(!isExpanded)} startIcon={<MenuToggle isOpen={isExpanded} />} />
          <NavContainer>
            <motion.div initial={{ opacity: 0 }} variants={DEFAULT_VARIANTS} animate={expansionState}>
              <NavHeader direction="column" align="flex-start" gap="8px">
                <div>{userInfo?.storeName}</div>
                <div>{userId}</div>
              </NavHeader>
            </motion.div>

            {MENU_LIST.map(({ path, label, icon }) => (
              <Link key={path} to={path} className={location.pathname === path ? 'active' : undefined}>
                <span className="menu-icon">{icon}</span>
                <motion.span initial={{ opacity: 0 }} variants={FADE_VARIANTS} animate={expansionState}>
                  {label}
                </motion.span>
              </Link>
            ))}
          </NavContainer>

          {/* 하단 푸터 영역 (확장 시) */}
          <NavFooter variants={FADE_VARIANTS} animate={expansionState}>
            <FlexBoxCenter direction="column" sx={{ paddingBottom: '20px', fontSize: '20px', fontWeight: '500', color: '#ffffff' }}>
              <div>고객센터</div>
              <div>1644-5047</div>
            </FlexBoxCenter>

            <FlexBoxCenter direction="column" gap="8px">
              <LogoutButton onClick={handleCafeteriaLogout}>로그아웃</LogoutButton>
              <ExitButton onClick={handleElectronClose}>종료</ExitButton>

              <Box sx={{ paddingTop: '20px', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>{version}</Box>
            </FlexBoxCenter>
          </NavFooter>

          {/* 하단 아이콘 영역 (축소 시) */}
          <NavFooter variants={DEFAULT_VARIANTS} animate={!isExpanded ? 'open' : 'closed'}>
            <VendysIcon style={{ width: '42px' }} />
          </NavFooter>
        </MotionDivContainer>
      </Box>

      {/* Dim Overlay */}
      <DimOverlay variants={DIM_VARIANTS} animate={expansionState} onClick={() => setIsExpanded(!isExpanded)} />

      {!isFocusIn ? (
        <Box
          sx={{
            display: 'none',

            zIndex: 1000,
            position: 'fixed',
            top: 0,
            left: 0,
            // display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100vh',
            background: '#FF3B3E'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: 32, fontWeight: 700, color: '#ffffff' }}>주문 불가</Box>
            <Box sx={{ fontSize: 24, color: '#ffffff' }}>화면을 터치한 후 바코드를 인식해주세요.</Box>
          </Box>
        </Box>
      ) : null}

      {!isOnLine ? (
        <Box
          sx={{
            zIndex: 1000,
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100vh',
            background: '#FF3B3E'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: 32, fontWeight: 700, color: '#ffffff' }}>주문 불가</Box>
            <Box sx={{ fontSize: 24, color: '#ffffff' }}>장부모드로 전환해주세요</Box>
          </Box>
        </Box>
      ) : null}

      {!isMatched || !!header ? (
        <Box
          sx={{
            position: 'fixed',
            top: '8px',
            left: '80px',
            display: 'flex',
            alignItems: 'center',
            width: 'calc(100% - 80px - 8px)',
            height: '75px',
            margin: '8px 0px',
            fontSize: '24px',
            fontWeight: '700'
          }}
        >
          <Box
            sx={{
              width: ' 100%',
              height: '100%',
              background: '#fff',
              margin: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              padding: '0px 16px'
            }}
          >
            {header}
          </Box>
        </Box>
      ) : null}

      <main
        style={{
          flexGrow: 1,
          height: `calc(100% - ${!isMatched || !!header ? 90 : 0}px)`,
          paddingTop: `${!isMatched || !!header ? 90 : 0}px`,
          marginLeft: '80px',
          borderRadius: '10px',
          outline: '8px solid #252525'
        }}
      >
        <Outlet />
      </main>
    </Box>
  );
};

export { MainLayout, MENU_LIST };
export default MainLayout;
