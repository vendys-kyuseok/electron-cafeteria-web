import { useEffect, useState, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { DialogTitle, DialogContent, DialogActions, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { DefaultKeyboard } from '@components';
import { getMenuDisplayState } from '@utils/storageUtils';
import type { TicketType } from '@hooks/cafeteria';

import type { MenuDisplayValue } from './index';
import { StyledDialog, KeyboardWrapper, KeyboardInput } from './styles';

interface MenuDisplayStateModalProps {
  menuId?: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: MenuDisplayValue) => void;
}

const MenuDisplayStateModal = ({ menuId, open, onClose, onSubmit }: MenuDisplayStateModalProps) => {
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputMenuNameRef = useRef<HTMLInputElement>(null);
  const inputMenuPriceRef = useRef<HTMLInputElement>(null);

  const [activeRef, setActiveRef] = useState<React.RefObject<HTMLInputElement> | null>(null);
  const [menuName, setMenuName] = useState<string>('');
  const [menuPrice, setMenuPrice] = useState<string>('');
  const [ticketType, setTicketType] = useState<TicketType>('WON');

  useEffect(() => {
    if (open && menuId) {
      const menuDisplay = getMenuDisplayState() ?? [];
      const targetMenu = menuDisplay.find((item) => item.id === menuId);

      setMenuName(String(targetMenu?.name ?? ''));
      setMenuPrice(String(targetMenu?.price ?? ''));
      setTicketType(targetMenu?.ticketType ?? 'WON');
    }
  }, [open, menuId]);

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
    };
  }, []);

  const handleSubmit = () => {
    if (!menuId) return;
    const nextMenuName = inputMenuNameRef.current?.value ?? menuName;
    const nextMenuPrice = inputMenuPriceRef.current?.value ?? menuPrice;

    onSubmit?.({ menuId, menuName: nextMenuName, menuPrice: nextMenuPrice, ticketType });
  };

  const handleInputFocus = (targetRef: React.RefObject<HTMLInputElement>) => {
    blurTimerRef.current && clearTimeout(blurTimerRef.current);
    setActiveRef(targetRef);
  };

  const handleInputBlur = () => {
    blurTimerRef.current = setTimeout(() => setActiveRef(null), 50);

    setMenuName(inputMenuNameRef.current?.value || '');
    setMenuPrice(inputMenuPriceRef.current?.value || '');
  };

  const handleModalClose = () => {
    onClose();
    // 입력 값 초기화
    setMenuName('');
    setMenuPrice('');
    setTicketType('WON');
  };

  // 키보드 노출중에 모달 닫힘 방지
  const handleClose = !activeRef?.current ? handleModalClose : undefined;
  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ padding: '8px 16px', fontSize: '20px', fontWeight: '700' }}>메뉴 정보 수정</DialogTitle>
      <DialogContent sx={{ padding: '8px 16px' }}>
        <Box className="description-text">※ 실제 메뉴 정보는 유지되며, 결제 화면에 노출될 정보만 설정하는 화면입니다.</Box>
        <Box className="section-title">표시 메뉴명</Box>
        <KeyboardInput
          size="small"
          placeholder="표시할 메뉴명을 입력해주세요"
          value={menuName}
          onChange={(event) => setMenuName(event.target.value)}
          inputRef={inputMenuNameRef}
          onFocus={() => handleInputFocus(inputMenuNameRef)}
          onBlur={handleInputBlur}
        />

        <Box className="section-title">표시 가격</Box>
        <KeyboardInput
          size="small"
          placeholder="표시할 가격을 입력해주세요"
          value={menuPrice}
          onChange={(event) => setMenuPrice(event.target.value)}
          inputRef={inputMenuPriceRef}
          onFocus={() => handleInputFocus(inputMenuPriceRef)}
          onBlur={handleInputBlur}
        />

        <Box className="section-title">표시 단위</Box>
        <RadioGroup row value={ticketType} onChange={({ target }) => setTicketType(target.value as TicketType)}>
          <FormControlLabel value="WON" control={<Radio size="small" sx={{ padding: '8px' }} />} label="원" />
          <FormControlLabel value="TICKET" control={<Radio size="small" sx={{ padding: '8px' }} />} label="장" />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button className="cancel-button" onClick={handleModalClose}>
          취소
        </Button>
        <Button onClick={handleSubmit}>저장</Button>
      </DialogActions>

      {activeRef?.current ? (
        <KeyboardWrapper>
          <DefaultKeyboard activeRef={activeRef} />
        </KeyboardWrapper>
      ) : null}
    </StyledDialog>
  );
};

export default MenuDisplayStateModal;
