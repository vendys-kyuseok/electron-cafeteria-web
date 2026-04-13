import { useRef, useState } from 'react';
import { NumberKeyboard } from '@components';
import { useAuth } from '@hooks/auth';
import { useElectron } from '@hooks/electron';
import { Box, TextField } from '@mui/material';
import { PowerSettingsNew } from '@mui/icons-material';

import FooterLogo from '@images/footerLogo.svg?react';

import { LoginPageContainer, LoginFormWrapper, LoginButton, CloseButton } from './styles';

const LoginPage = () => {
  const electron = useElectron();

  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputUserNameRef = useRef<HTMLInputElement>(null);
  const inputPasswordRef = useRef<HTMLInputElement>(null);

  const [activeRef, setActiveRef] = useState<React.RefObject<HTMLInputElement> | null>(null);

  const { login } = useAuth();

  const handleWebClose = () => {
    electron.send('electron-close');
  };

  const handleLoginSubmit = async () => {
    if (!inputUserNameRef?.current || !inputPasswordRef?.current) return;
    await login({ username: inputUserNameRef.current?.value, password: inputPasswordRef.current?.value });
  };

  const handleFocusInput = (targetRef: React.RefObject<HTMLInputElement>) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setActiveRef(targetRef);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setActiveRef(null), 50);
  };

  return (
    <LoginPageContainer>
      <CloseButton startIcon={<PowerSettingsNew />} onClick={handleWebClose}>
        종료
      </CloseButton>

      <LoginFormWrapper>
        <div id="messages">a</div>
        <Box className="login-content">
          <Box sx={{ padding: '12px 0px 4px' }}>아이디</Box>
          <TextField inputRef={inputUserNameRef} onFocus={() => handleFocusInput(inputUserNameRef)} onBlur={handleBlur} />
          <Box sx={{ padding: '12px 0px 4px' }}>비밀번호</Box>
          <TextField inputRef={inputPasswordRef} onFocus={() => handleFocusInput(inputPasswordRef)} onBlur={handleBlur} type="password" />

          <LoginButton onClick={handleLoginSubmit}>로그인하기</LoginButton>
          <Box className="vendys-number">고객센터 1644-5047</Box>
        </Box>

        <Box className="login-footer">
          <FooterLogo />
        </Box>
      </LoginFormWrapper>

      {activeRef?.current ? (
        <Box sx={{ position: 'fixed', bottom: '84px' }} onMouseDown={(event) => event.preventDefault()}>
          <NumberKeyboard activeRef={activeRef} />
        </Box>
      ) : null}
    </LoginPageContainer>
  );
};

export default LoginPage;
