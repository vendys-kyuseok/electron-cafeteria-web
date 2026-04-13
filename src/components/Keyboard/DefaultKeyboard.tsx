import { Box, Button, type SxProps } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import styled from '@emotion/styled';
import React, { useMemo, useState } from 'react';
import { checkKoreanInput, composeKoreanInput } from '@utils/keyboardUtils';

const KeyboardItem = styled(Button)`
  max-width: 64px;
  height: 45px;
  background: #ffffff;
  text-transform: none;
  ${({ theme }) => theme.typography.font16B}
  color: #000000;

  &.Mui-disabled {
    background: #ffffff;
  }
`;

type KeyboardLanguage = 'en' | 'ko';
type KeyboardMode = 'normal' | 'shifted';
type KeyboardRow = string[];
type KeyboardLayout = Record<KeyboardMode, KeyboardRow[]>;

const SPECIAL_KEY = {
  spacer: 'none',
  space: 'space',
  caps: 'caps',
  enter: 'enter',
  language: 'lang',
  shift: 'shift',
  backspace: 'backspace'
};

const BACKSPACE_KEY = 'backspace';
const KEY_LAYOUTS: Record<KeyboardLanguage, KeyboardLayout> = {
  en: {
    normal: [
      ['none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
      ['', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', ''],
      ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
      ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
      ['', '@', '.com', 'space', 'lang', '']
    ],
    shifted: [
      ['none', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'backspace'],
      ['', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', ''],
      ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'enter'],
      ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'shift'],
      ['', '@', '.com', 'space', 'lang', '']
    ]
  },
  ko: {
    normal: [
      ['none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
      ['', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', '[', ']', ''],
      ['caps', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', ';', "'", 'enter'],
      ['shift', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', ',', '.', '/', 'shift'],
      ['', '@', '.com', 'space', 'lang', '']
    ],
    shifted: [
      ['none', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'backspace'],
      ['', 'ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅒ', 'ㅖ', '{', '}', ''],
      ['caps', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', ':', '"', 'enter'],
      ['shift', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '<', '>', '?', 'shift'],
      ['', '@', '.com', 'space', 'lang', '']
    ]
  }
};

const KEYBOARD_WRAPPER_SX: SxProps = {
  width: 'fit-content',
  padding: '6px',
  background: '#cccccc',
  borderRadius: '4px'
};

const KEYBOARD_ROW_SX: SxProps = {
  display: 'flex',
  gap: '4px',
  width: '100%',
  padding: '2px',
  background: '#cccccc',
  borderRadius: '4px'
};

interface DefaultKeyboardProps {
  activeRef: React.RefObject<HTMLInputElement> | null;
}

const DefaultKeyboard = ({ activeRef }: DefaultKeyboardProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<KeyboardLanguage>('ko');
  const [isShiftActive, setIsShiftActive] = useState(false);

  const keyboardMode: KeyboardMode = isShiftActive ? 'shifted' : 'normal';

  const visibleRows = useMemo(() => KEY_LAYOUTS[currentLanguage][keyboardMode], [currentLanguage, keyboardMode]);

  const applyInputChange = (inputElement: HTMLInputElement, nextValue: string, nextCursorIndex: number) => {
    inputElement.value = nextValue;
    inputElement.setSelectionRange(nextCursorIndex, nextCursorIndex);
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const handleKeyPress = (event: React.MouseEvent, pressedKey: string) => {
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
      const isKoreanJamoKey = checkKoreanInput(pressedKey);
      if (currentLanguage === 'ko' && isKoreanJamoKey) {
        const composed = composeKoreanInput(currentValue, selectionStart, selectionEnd, pressedKey);
        nextValue = composed.nextValue;
        nextCursorIndex = composed.nextCursorIndex;
      } else {
        nextValue = currentValue.slice(0, selectionStart) + pressedKey + currentValue.slice(selectionEnd);
        nextCursorIndex = selectionStart + pressedKey.length;
      }
    }

    if (nextValue === currentValue && nextCursorIndex === selectionStart) return;

    applyInputChange(inputElement, nextValue, nextCursorIndex);
  };

  const handleSpecialKeyPress = (keyToken: string) => {
    if (keyToken === SPECIAL_KEY.shift) {
      setIsShiftActive((prev) => !prev);
      return;
    }

    if (keyToken === SPECIAL_KEY.language) {
      setCurrentLanguage((prev) => (prev === 'en' ? 'ko' : 'en'));
      setIsShiftActive(false);
    }
  };

  const renderKeyItem = (keyToken: string, rowIndex: number, columnIndex: number) => {
    const keyId = `key-${rowIndex}-${columnIndex}-${keyToken || 'blank'}`;

    switch (keyToken) {
      case SPECIAL_KEY.spacer:
        return <KeyboardItem key={keyId} sx={{ minWidth: '32px' }} />;
      case SPECIAL_KEY.space:
        return (
          <KeyboardItem key={keyId} sx={{ minWidth: 'calc(100% - 344px)' }} onMouseDown={(event) => handleKeyPress(event, ' ')}>
            {keyToken}
          </KeyboardItem>
        );
      case SPECIAL_KEY.caps:
      case SPECIAL_KEY.enter:
        return (
          <KeyboardItem key={keyId} sx={{ minWidth: '98px' }}>
            {keyToken}
          </KeyboardItem>
        );
      case SPECIAL_KEY.language:
        return (
          <KeyboardItem
            key={keyId}
            onClick={() => handleSpecialKeyPress(SPECIAL_KEY.language)}
            onMouseDown={(event) => event.preventDefault()}
          >
            {keyToken}
          </KeyboardItem>
        );
      case SPECIAL_KEY.shift:
        return (
          <KeyboardItem
            key={keyId}
            sx={{ minWidth: '132px' }}
            onClick={() => handleSpecialKeyPress(SPECIAL_KEY.shift)}
            onMouseDown={(event) => event.preventDefault()}
          >
            {keyToken}
          </KeyboardItem>
        );
      case SPECIAL_KEY.backspace:
        return (
          <KeyboardItem key={keyId} sx={{ minWidth: '96px' }} onMouseDown={(event) => handleKeyPress(event, BACKSPACE_KEY)}>
            <BackspaceIcon sx={{ paddingRight: '2px' }} />
          </KeyboardItem>
        );
      default:
        return (
          <KeyboardItem key={keyId} onMouseDown={(event) => handleKeyPress(event, keyToken)}>
            {keyToken}
          </KeyboardItem>
        );
    }
  };

  return (
    <Box sx={KEYBOARD_WRAPPER_SX}>
      {visibleRows.map((rowKeysItems, rowIndex) => (
        <Box key={`row-${rowIndex}`} sx={KEYBOARD_ROW_SX}>
          {rowKeysItems.map((keyToken, columnIndex) => renderKeyItem(keyToken, rowIndex, columnIndex))}
        </Box>
      ))}
    </Box>
  );
};

export { DefaultKeyboard };
export default DefaultKeyboard;
