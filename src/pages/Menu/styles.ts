import styled from '@emotion/styled';
import { Box, Button, Switch, TextField, Dialog } from '@mui/material';

export const WhiteWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 125px - 48px - 16px);
  padding: 8px;
  border-radius: 10px;
  background: #ffffff;
`;

export const SelectedMenuButton = styled(Button)`
  position: fixed;
  bottom: 16px;
  width: calc(100% - 104px);
  height: 50px;
  ${({ theme }) => theme.typography.font18B}
  color: #ffffff;
`;

export const StyledSwitch = styled(Switch)`
  width: 42px;
  height: 22px;
  padding: 0px;
  .MuiSwitch-switchBase {
    padding: 0px;
    margin: 2px;
    &.Mui-checked {
      .MuiSwitch-thumb {
        background-color: ${({ theme }) => theme.color.white};
      }
      & + .MuiSwitch-track {
        opacity: 0.9;
      }
    }
  }
  .MuiSwitch-thumb {
    box-sizing: border-box;
    width: 18px;
    height: 18px;
  }
  .MuiSwitch-track {
    border-radius: 26px;
  }
`;

export const KeyboardWrapper = styled(Box)`
  position: fixed;
  z-index: 100;
  left: 50%;
  bottom: 16px;
  transform: translate(-50%, 0px);
  background: ${({ theme }) => theme.color.white};
`;

export const KeyboardInput = styled(TextField)`
  width: 100%;
  & input {
    padding: 8px 10px;
  }
`;

export const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    width: 450px;

    .description-text {
      ${({ theme }) => theme.typography.font12B}
    }
    .section-title {
      padding: 16px 0px 4px;
      ${({ theme }) => theme.typography.font14B}
    }
    .cancel-button {
      background: ${({ theme }) => theme.color.gray02};
      color: ${({ theme }) => theme.color.black};
    }
    .MuiRadioGroup-root {
      margin-left: 4px;
    }
  }
`;
