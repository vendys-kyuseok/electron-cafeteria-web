import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';
import { FlexBoxCenter } from '@styles';

export const NavContainer = styled.div`
  display: flex;
  flex-direction: column;

  a {
    display: flex;
    align-items: center;
    gap: 16px;
    /* width: calc(100% - 18px); */
    height: 70px;
    padding: 0px 20px;
    white-space: pre;
    text-decoration: none;
    ${({ theme }) => theme.typography.font20R}
    color: #ffffff;
    border-bottom: 1px solid #121212;

    &.active,
    &.active:hover {
      background: #343b45;

      /* background: #1db53a; */

      svg {
        padding: 8px 5px;
        background: #1db53a;
        border-radius: 4px;
      }
    }
    &:hover {
      /* background: #343b45; */
      /* background: #2d2d2d; */
      background: #333333;
    }
    & span.menu-icon {
      width: 40px;
      height: 40px;
      svg {
        width: 30px;
        padding: 8px 5px;
        /* padding-bottom: 2px; */
      }
    }
  }
`;

export const NavHeader = styled(FlexBoxCenter)`
  margin-top: 8px;
  padding: 16px;
  white-space: pre;
  ${({ theme }) => theme.typography.font20R}
  color: #ffffff;
`;

export const NavFooter = styled(motion.div)`
  position: absolute;
  opacity: 0;
  bottom: 30px;
  width: 100%;
  text-align: center;
`;

export const MotionDivContainer = styled(motion.div)`
  position: relative;
  width: 80px;
  height: 100%;
  white-space: pre;
  background: #252525;
`;

export const LogoutButton = styled(Button)`
  width: calc(100% - 60px);
  height: 45px;
  ${({ theme }) => theme.typography.font16B}
  color: #ffffff;
`;

export const ExitButton = styled(LogoutButton)`
  background: #474747;
  &:hover {
    background: #333333;
  }
`;

export const NavToggleButton = styled(Button)`
  z-index: 100;
  position: absolute;
  top: 24px;
  right: 12.5px;
  width: 55px;
  min-width: 55px;
  height: 55px;

  .MuiButton-startIcon {
    scale: 0.8;
    margin: 0px;
  }
`;

export const DimOverlay = styled(motion.div)`
  z-index: 100;
  position: absolute;
  opacity: 0;
  display: none;
  width: 100%;
  height: calc(100vh - 16px);
  background: #000000;
`;
