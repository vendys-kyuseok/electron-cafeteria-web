import styled from '@emotion/styled';
import { Box, Chip, Dialog, DialogContent } from '@mui/material';

// Payment Container Styled
export const PaymentContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #333333;

  .payment-menu-title {
    margin-bottom: 8px;
    ${({ theme }) => theme.typography.font32B}
  }

  .payment-menu-amount {
    font-size: 56px;
    font-weight: 700;
    ${({ theme }) => theme.color.primary}
  }
`;

export const PaymentContent = styled(Box)`
  text-align: center;
  color: ${({ theme }) => theme.color.white};
`;

export const PaymentInstruction = styled.div`
  margin: 32px 0px 8px;
  ${({ theme }) => theme.typography.font24B}
`;

export const PaymentSubInstruction = styled.div`
  ${({ theme }) => theme.typography.font18R}
  color: ${({ theme }) => theme.color.gray03}
`;

// Mode Chip Styled
export const PaymentModeChip = styled(Chip)`
  margin-bottom: 20px;
  padding: 8px 12px;
  border: 1px solid #ffffff4d;
  background: #ffca2833;
  color: #ffffff;
  font-weight: 700;

  .MuiChip-label {
    padding: 0;
  }
`;

// Overlay Styled
export const PaymentProcessingOverlay = styled(Box)`
  z-index: 100;
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #333333;
  outline: 4px solid #000000;
  ${({ theme }) => theme.typography.font32B}
  color: #ffffff;
`;

// Dialog Styled
export const PaymentDialog = styled(Dialog)``;
export const PaymentDialogContent = styled(DialogContent)<{ $mode?: 'success' | 'error' }>`
  z-index: 20;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100vw - 160px);
  height: calc(100vh - 160px);
  border: solid 4px ${({ theme, $mode }) => ($mode === 'success' ? theme.color.primary : theme.color.red)};

  ::after {
    content: '';
    position: absolute;
    opacity: 0.08;
    z-index: -10;
    width: 100%;
    height: 100%;
    background: ${({ theme, $mode }) => ($mode === 'success' ? theme.color.primary : theme.color.red)};
  }
`;
