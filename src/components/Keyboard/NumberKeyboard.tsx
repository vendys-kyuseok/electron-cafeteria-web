import { Box, Button, Grid, type SxProps } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import styled from '@emotion/styled';
import type { MouseEvent, RefObject } from 'react';

const KeyboardItem = styled(Button)`
  width: 80px;
  height: 45px;
  background: #ffffff;
  ${({ theme }) => theme.typography.font16B}
  color: #000000;
`;

interface NumberKeyboardProps {
  activeRef: RefObject<HTMLInputElement> | null;
}

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const BACKSPACE_KEY = 'backspace';

const KEYBOARD_WRAPPER_SX: SxProps = {
  width: '248px',
  padding: '6px',
  background: '#CED2D9B2',
  borderRadius: '4px'
};

const KEYBOARD_GRID_SX: SxProps = {
  justifyContent: 'flex-end'
};

const NumberKeyboard = ({ activeRef }: NumberKeyboardProps) => {
  const applyInputChange = (inputElement: HTMLInputElement, nextValue: string, nextCursorIndex: number) => {
    inputElement.value = nextValue;
    inputElement.setSelectionRange(nextCursorIndex, nextCursorIndex);
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const handleKeyPress = (event: MouseEvent, pressedKey: string) => {
    event.preventDefault();

    const inputElement = activeRef?.current;
    if (!inputElement) return;

    const selectionStart = inputElement.selectionStart ?? 0;
    const selectionEnd = inputElement.selectionEnd ?? 0;

    const hasSelection = selectionStart !== selectionEnd;
    const currentValue = inputElement.value ?? '';

    let nextValue = currentValue;
    let nextCursorIndex = selectionStart;

    if (pressedKey === BACKSPACE_KEY) {
      if (hasSelection) {
        nextValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
      } else if (selectionStart > 0) {
        nextValue = currentValue.slice(0, selectionStart - 1) + currentValue.slice(selectionEnd);
        nextCursorIndex = selectionStart - 1;
      }
    } else {
      nextValue = currentValue.slice(0, selectionStart) + pressedKey + currentValue.slice(selectionEnd);
      nextCursorIndex = selectionStart + pressedKey.length;
    }

    applyInputChange(inputElement, nextValue, nextCursorIndex);
  };

  return (
    <Box sx={KEYBOARD_WRAPPER_SX}>
      <Grid container spacing={0.5} sx={KEYBOARD_GRID_SX}>
        {DIGIT_KEYS.map((digit) => (
          <KeyboardItem key={digit} onMouseDown={(event) => handleKeyPress(event, digit)}>
            {digit}
          </KeyboardItem>
        ))}
        <KeyboardItem onMouseDown={(event) => handleKeyPress(event, BACKSPACE_KEY)}>
          <BackspaceIcon />
        </KeyboardItem>
      </Grid>
    </Box>
  );
};

export { NumberKeyboard };
export default NumberKeyboard;
