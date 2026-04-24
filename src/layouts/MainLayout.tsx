/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useMatch } from 'react-router-dom';

import { motion } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import SdCardAlertIcon from '@mui/icons-material/SdCardAlert';
import { Box, Button } from '@mui/material';

import VendysIcon from '@assets/ic_vendys.svg?react';
import { MenuToggle } from '@components';
import { useAuth, useCafeteriaMe } from '@hooks/auth';
import { useElectronStatusCheck } from '@hooks/cafeteria';
import { useElectron } from '@hooks/electron';
import { version } from '@package';
import { FlexBoxCenter } from '@styles';
import { getLocalStorage, getSelectedMenu, getCafeteriaStore, setLocalStorage } from '@utils/storageUtils';

// Styled Component
import * as Nav from './styles';
const { MotionDivContainer, LogoutButton, ExitButton, DimOverlay, FocusOutOverlay, OffLineOverlay, HeaderContainer } = Nav;

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
  { path: '/cafeteria/update', label: '업데이트 관리', icon: <BrowserUpdatedIcon /> },
  { path: '/cafeteria/latestError', label: '최근 에러 내역', icon: <SdCardAlertIcon /> }
];

export type MainLayoutOutletContext = {
  isFocusIn: boolean;
  isOnLine: boolean;
};

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMatched = useMatch('/cafeteria/payment');
  const { useIpcListener, ...electron } = useElectron(); // Electron Custom Hook

  const { data } = useCafeteriaMe(); // 사용자 정보 조회
  const { logout: onCafeteriaLogout } = useAuth();
  const { isFocusIn, isOnLine } = useElectronStatusCheck();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOffLineModal, setIsOffLineModal] = useState<boolean>(false);

  const cafeteriaInfo = data || getCafeteriaStore();
  const userId = getLocalStorage('userId');

  useEffect(() => {
    setIsExpanded(false);
    electron.send('cafeteria-offline-file-send', { storeId: cafeteriaInfo?.storeId });
  }, [location.pathname, cafeteriaInfo]);

  useEffect(() => {
    document.body.focus();
  }, [location.pathname, isExpanded]);

  useIpcListener('electron-mac-address', (_, macAddress) => setLocalStorage('macAddress', macAddress));
  useIpcListener('electron-console-log', (_, ...args) => {
    // Electron Console 브라우서에서 확인
    console.log('[Electron Console]', ...args);
  });

  const handleElectronClose = () => electron.send('electron-close');

  const handleOffLineMode = () => {
    const selectedMenu = getSelectedMenu();

    if (isOnLine || !cafeteriaInfo) return;
    if (!selectedMenu) navigate('/cafeteria/menu');

    setIsOffLineModal(true);
  };

  const header = MENU_LIST.find(({ path }) => path === location.pathname)?.label;
  const expansionState = isExpanded ? 'open' : 'closed';
  const outletContext: MainLayoutOutletContext = { isFocusIn, isOnLine };
  return (
    <Box sx={{ display: 'flex', height: `100vh`, boxSizing: 'border-box', border: '8px solid #252525', borderLeft: 'none' }}>
      <Box sx={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        <MotionDivContainer animate={{ width: isExpanded ? 320 : 80 }} transition={DEFAULT_TRANSITION}>
          <Nav.NavToggleButton onClick={() => setIsExpanded(!isExpanded)} startIcon={<MenuToggle isOpen={isExpanded} />} />
          <Nav.NavContainer>
            <motion.div initial={{ opacity: 0 }} variants={DEFAULT_VARIANTS} animate={expansionState}>
              <Nav.NavHeader direction="column" align="flex-start" gap="8px">
                <div>{cafeteriaInfo?.storeName}</div>
                <div>{userId}</div>
              </Nav.NavHeader>
            </motion.div>

            {MENU_LIST.map(({ path, label, icon }) => (
              <Link key={path} to={path} className={location.pathname === path ? 'active' : undefined}>
                <span className="menu-icon">{icon}</span>
                <motion.span initial={{ opacity: 0 }} variants={FADE_VARIANTS} animate={expansionState}>
                  {label}
                </motion.span>
              </Link>
            ))}
          </Nav.NavContainer>

          {/* 하단 푸터 영역 (확장 시) */}
          <Nav.NavFooter variants={FADE_VARIANTS} animate={expansionState}>
            <FlexBoxCenter direction="column" className="cafeteria-cs-number">
              <div>고객센터</div>
              <div>1644-5047</div>
            </FlexBoxCenter>

            <FlexBoxCenter direction="column" gap="8px">
              <LogoutButton onClick={onCafeteriaLogout}>로그아웃</LogoutButton>
              <ExitButton onClick={handleElectronClose}>종료</ExitButton>

              <Box className="cafeteria-version">{version}</Box>
            </FlexBoxCenter>
          </Nav.NavFooter>

          {/* 하단 아이콘 영역 (축소 시) */}
          <Nav.NavFooter variants={DEFAULT_VARIANTS} animate={!isExpanded ? 'open' : 'closed'}>
            <VendysIcon style={{ width: '42px' }} />
          </Nav.NavFooter>
        </MotionDivContainer>
      </Box>

      {/* LNB Dim Overlay */}
      <DimOverlay variants={DIM_VARIANTS} animate={expansionState} onClick={() => setIsExpanded(false)} />

      {/* 화면 포커스 아웃 시 노출 */}
      {!isFocusIn ? (
        <FocusOutOverlay>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: 32, fontWeight: 700, color: '#ffffff' }}>주문 불가</Box>
            <Box sx={{ fontSize: 24, color: '#ffffff' }}>화면을 터치한 후 바코드를 인식해주세요.</Box>
          </Box>
        </FocusOutOverlay>
      ) : null}

      {/* 인터넷 오프라인 시 노출 */}
      {!isOnLine && !isOffLineModal ? (
        <OffLineOverlay>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: 32, fontWeight: 700, color: '#ffffff' }}>주문 불가</Box>
            <Box sx={{ fontSize: 24, color: '#ffffff' }}>장부모드로 전환해주세요</Box>

            <Button onClick={handleOffLineMode}>장부모드</Button>
          </Box>
        </OffLineOverlay>
      ) : null}

      {!isMatched || !!header ? (
        <HeaderContainer>
          <Box className="header-content">{header}</Box>
        </HeaderContainer>
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
        <Outlet context={outletContext} />
      </main>
    </Box>
  );
};

export { MainLayout, MENU_LIST };
export default MainLayout;
