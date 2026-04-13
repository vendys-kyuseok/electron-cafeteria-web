import styled from '@emotion/styled';
import { Button } from '@mui/material';

export const LoginPageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: ${({ theme }) => theme.color.bgGray};
`;

export const LoginFormWrapper = styled.div`
  overflow: hidden;
  width: 420px;
  background: ${({ theme }) => theme.color.white};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .login-content {
    padding: 72px 36px 8px;

    .vendys-number {
      opacity: 0.5;
      padding: 16px 0px;
      text-align: center;
      color: ${({ theme }) => theme.color.gray05};
    }
    .MuiTextField-root {
      width: 100%;

      & input {
        height: 48px;
        padding: 0px 16px;
      }
    }
  }
  .login-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    background: ${({ theme }) => theme.color.gray01};

    & svg {
      width: 180px;
    }
  }
`;

export const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
  margin: 30px 0px 10px;
  ${({ theme }) => theme.typography.font18B}
  color: ${({ theme }) => theme.color.white};
`;

export const CloseButton = styled(Button)`
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  gap: 8px;
  height: 48px;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.color.white};
  border-color: ${({ theme }) => theme.color.white};
  ${({ theme }) => theme.typography.font18B}
  color: ${({ theme }) => theme.color.gray05};

  .MuiButton-icon {
    margin: 0%;
  }
`;
