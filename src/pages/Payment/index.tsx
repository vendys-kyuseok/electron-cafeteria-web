/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useOutletContext } from 'react-router-dom';

import { useBarcodeScanner } from '@utils/barcodeUtils';
import { getCafeteriaStore, getSelectedMenu, getLatestErrors, setLatestErrors, type LatestErrorLog } from '@utils/storageUtils';
import { usePaymentCafeteriaBarcode } from '@hooks/cafeteria';
import {} from '@emotion/styled';
import type { MainLayoutOutletContext } from '@layouts/MainLayout';
import VendysIcon from '@assets/ic_vendys.svg?react';
import asdasdasd from './phone-hand-barcode-transparent.png';

import {
  PaymentProcessingOverlay,
  PaymentContainer,
  PaymentInstruction,
  PaymentSubInstruction,
  PaymentDialog,
  PaymentDialogContent
} from './styles';
import { useElectron } from '@hooks/electron';
import { FlexBoxCenter } from '@styles';

type PaymentMode = 'online' | 'offline';
type PaymentStatus = 'success' | 'error';

type PaymentApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};
type PaymentResponse = {
  tr: number;
  user: {
    id: string;
    name: string;
    comId: string;
    comName: string;
  };
  payment: {
    coupon: string;
    payroomIdx: number;
    date: number;
  };
};

type PaymentState = {
  mode: PaymentMode; // 성공/실패 판단
  status: PaymentStatus; // 온라인/오프라인 구분
  barcode: string;
  message: string; // 다이얼로그 문구 사용
  result: PaymentResponse | null; // 온라인 성공일 때만 실제 결제 응답 사용
};

type OfflineBarcodeResult = {
  isSuccess: boolean;
  message?: string;
};

const SUCCESS_MESSAGE = {
  online: '결제가 완료되었습니다.',
  offline: '장부 저장이 완료되었습니다.'
};
const ERROR_MESSAGE = {
  online: '결제 처리에 실패했습니다. 다시 시도해 주세요.',
  offline: '장부 저장에 실패했습니다. 다시 시도해 주세요.'
};

const PaymentPage = () => {
  const electron = useElectron();
  const { isOnLine } = useOutletContext<MainLayoutOutletContext>();
  const { mutateAsync, isPending } = usePaymentCafeteriaBarcode();

  const cafeteriaStore = getCafeteriaStore();
  const selectedMenu = getSelectedMenu();

  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const appendLatestErrorLog = (barcode: string, errorMessage: string) => {
    const existingLogs = getLatestErrors() || [];
    const nextLogs: LatestErrorLog[] = [
      {
        useDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        barcode,
        errorContent: errorMessage
      },
      ...existingLogs
    ].slice(0, 10);

    setLatestErrors(nextLogs);
  };

  const setPaymentBaseError = (barcode: string, paymentMode: PaymentMode) => {
    const errorMessage = !selectedMenu?.id ? '메뉴를 먼저 선택해 주세요.' : '매장 정보를 확인해 주세요.';

    setPaymentState({
      mode: paymentMode,
      status: 'error',
      barcode,
      message: errorMessage,
      result: null
    });
    setIsDialogOpen(true);
    setTimeout(() => setIsDialogOpen(false), 1500);
  };

  const handleBarcodeScan = async (barcode: string) => {
    const paymentMode: PaymentMode = isOnLine ? 'online' : 'offline';
    const hasSelectedMenu = !!selectedMenu?.id;
    const hasSelectedStore = !!cafeteriaStore?.storeId;

    if (!hasSelectedMenu || !hasSelectedStore) {
      setPaymentBaseError(barcode, paymentMode);
      return;
    }

    const params = { store: { menu: selectedMenu?.id }, barcode: { id: barcode } };
    const paymentParams = { storeId: cafeteriaStore?.storeId, barcode, params };

    let paymentResult: PaymentResponse | null = null;
    let paymentStatus: PaymentStatus = 'success';
    let paymentMessage = SUCCESS_MESSAGE[paymentMode];

    try {
      if (paymentMode === 'online') {
        paymentResult = await mutateAsync(paymentParams);
      } else {
        const offlineResult = await electron.invoke<OfflineBarcodeResult>('cafeteria-offline-barcode', paymentParams);

        if (!offlineResult?.isSuccess) {
          paymentStatus = 'error';
          paymentMessage = offlineResult?.message ?? ERROR_MESSAGE.offline;
        }
      }
    } catch (error) {
      const paymentError = error as PaymentApiError;
      const message = paymentError?.response?.data?.message ?? null;

      paymentStatus = 'error';
      paymentMessage = message ?? ERROR_MESSAGE[paymentMode];
    }

    if (paymentStatus === 'error') {
      appendLatestErrorLog(barcode, paymentMessage);
    }

    setPaymentState({
      mode: paymentMode,
      status: paymentStatus,
      barcode,
      message: paymentMessage,
      result: paymentResult
    });
    setIsDialogOpen(true);
    // setTimeout(() => setIsDialogOpen(false), 1500);
  };

  useBarcodeScanner(handleBarcodeScan);

  const menuAmountText = Number(selectedMenu?.displayMenuPrice || 0).toLocaleString();
  const ticketTypeText = selectedMenu.ticketType === 'WON' ? '원' : '장';
  const instructionText = isOnLine ? '식권대장 바코드를 리더기에 스캔해 주세요' : '식권대장 바코드를 리더기에 스캔하면 장부에 저장됩니다';

  const dialogTitleText = paymentState?.status === 'success' ? '결제 완료' : '결제 실패';
  const dialogDateText = paymentState?.result?.payment?.date ? dayjs(paymentState.result.payment.date).format('YYYY-MM-DD HH:mm:ss') : null;
  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <PaymentContainer>
        <Box sx={{ textAlign: 'center', fontSize: '30px', fontWeight: '700', color: '#ffffff' }}>
          <FlexBoxCenter direction="column" justify="center" sx={{ height: '120px', padding: '32px 0px' }}>
            {selectedMenu?.isShowMenuName ? <Box className="payment-menu-title">{selectedMenu?.displayMenuName}</Box> : null}
            {selectedMenu?.isShowMenuPrice ? (
              <Box className="payment-menu-amount">
                {menuAmountText}
                {ticketTypeText}
              </Box>
            ) : null}
            {!selectedMenu?.isShowMenuName && !selectedMenu?.isShowMenuPrice ? (
              <FlexBoxCenter gap="42px">
                <VendysIcon style={{ scale: '1.8' }} />
                <Box sx={{ fontSize: '68px', color: '#1DB53A' }}>식권대장</Box>
              </FlexBoxCenter>
            ) : null}
          </FlexBoxCenter>
          {!isOnLine ? <div>장부모드</div> : null}

          <PaymentInstruction>{instructionText}</PaymentInstruction>
          <PaymentSubInstruction>결제중에는 다음 바코드를 받지 않습니다</PaymentSubInstruction>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '120px', padding: '18px 0px' }}>
            <Box sx={{ width: '240px', height: '240px', background: '#ffffff', borderRadius: '8px' }}>
              <img alt="" src={asdasdasd} style={{ width: '100%' }} />
            </Box>
            <Box sx={{ width: '240px', height: '240px', background: '#ffffff', borderRadius: '8px' }}>asdad</Box>
          </Box>
        </Box>
      </PaymentContainer>

      {isPending ? <PaymentProcessingOverlay>결제중</PaymentProcessingOverlay> : null}

      <PaymentDialog maxWidth="lg" open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <PaymentDialogContent $mode={paymentState?.status}>
          <Box sx={{ fontSize: '32px', fontWeight: 700 }}>{dialogTitleText}</Box>
          <Box sx={{ fontSize: '28px', fontWeight: 700 }}>{paymentState?.message}</Box>

          {paymentState?.result ? (
            <div>
              <div>{paymentState.result.user.comName}</div>
              <div>{paymentState.result.user.name}</div>
              <div>{menuAmountText}원</div>
              <div>{dialogDateText}</div>
            </div>
          ) : null}
        </PaymentDialogContent>
      </PaymentDialog>
    </Box>
  );
};

export default PaymentPage;
