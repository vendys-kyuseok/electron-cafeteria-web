import styled from '@emotion/styled';
import { Box } from '@mui/material';

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
