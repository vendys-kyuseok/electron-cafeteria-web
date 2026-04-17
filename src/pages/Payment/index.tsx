/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Box, Dialog, DialogContent } from '@mui/material';
import dayjs from 'dayjs';
import { useOutletContext } from 'react-router-dom';

import { useBarcodeScanner } from '@utils/barcodeUtils';
import { getCafeteriaStore, getSelectedMenu, getLatestErrors, setLatestErrors, type LatestErrorLog } from '@utils/storageUtils';
import { usePaymentCafeteriaBarcode } from '@hooks/cafeteria';
import {} from '@emotion/styled';
import type { MainLayoutOutletContext } from '@layouts/MainLayout';

import { PaymentProcessingOverlay } from './styles';
import { useElectron } from '@hooks/electron';

type PaymentApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type PaymentRequestParams = {
  storeId: string;
  barcode: string;
  params: {
    store: {
      menu: string;
    };
    barcode: {
      id: string;
    };
  };
};

interface PaymentResponse {
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
}

const getErrorMessage = (error: unknown): string | null => {
  const paymentError = error as PaymentApiError;
  return paymentError?.response?.data?.message ?? null;
};

const PaymentPage = () => {
  const electron = useElectron();
  const { isOnLine } = useOutletContext<MainLayoutOutletContext>();
  const { mutateAsync, isPending } = usePaymentCafeteriaBarcode();

  const cafeteriaStore = getCafeteriaStore();
  const selectedMenu = getSelectedMenu();

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false); // 성공 시 모달 노출 여부
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState<boolean>(false); // 실패 시 모달 노출 여부
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null); // 성공 시 응답 값
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null); // 실패 시 에러 메세지

  const closeDialogsWithDelay = () => {
    setTimeout(() => {
      setIsSuccessDialogOpen(false);
      setIsErrorDialogOpen(false);
    }, 1500);
  };

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

  const sendOfflineBarcode = (paymentParams: PaymentRequestParams) => {
    electron.send('cafeteria-offline-barcode', paymentParams);
  };

  const handleBarcodeScan = async (paymentParams: PaymentRequestParams) => {
    try {
      electron.send('cafeteria-barcode-send', paymentParams.barcode);
      const result = await mutateAsync(paymentParams);

      setIsSuccessDialogOpen(true);
      setPaymentResult(result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (errorMessage) {
        setIsErrorDialogOpen(true);
        setPaymentErrorMessage(errorMessage);
        // 에러 로그 기록
        appendLatestErrorLog(paymentParams.barcode, errorMessage);
      }
    } finally {
      closeDialogsWithDelay();
    }
  };

  useBarcodeScanner((barcode: string) => {
    const params = { store: { menu: selectedMenu.id }, barcode: { id: barcode } };
    const paymentParams = { storeId: cafeteriaStore.storeId, barcode, params };

    if (!isOnLine) {
      handleBarcodeScan(paymentParams);
    } else {
      sendOfflineBarcode(paymentParams);
    }
  });

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#333333' }}>
        <Box sx={{ textAlign: 'center', fontSize: '30px', fontWeight: '700', color: '#ffffff' }}>
          {selectedMenu?.isShowMenuName ? <div style={{ fontSize: '32px' }}>{selectedMenu.name}</div> : null}
          {selectedMenu?.isShowMenuPrice ? (
            <div style={{ fontSize: '56px' }}>{Number(selectedMenu.salesPrice || 0).toLocaleString()}원</div>
          ) : null}

          <div>
            <div>대충 아이콘</div>
          </div>

          {!isOnLine ? <div>장부모드</div> : null}

          <div style={{ fontSize: '24px' }}>식권대장 바코드를 리더기에 스캔해 주세요</div>
        </Box>
      </Box>

      {isPending ? <PaymentProcessingOverlay>결제중</PaymentProcessingOverlay> : null}

      <Dialog open={isSuccessDialogOpen} onClose={() => setIsSuccessDialogOpen(false)}>
        <DialogContent sx={{ width: 400 }}>
          <div>{paymentResult?.user?.comName}</div>
          <div>{paymentResult?.user?.name}</div>
          <div>{selectedMenu.salesPrice}</div>
          <div>{paymentResult?.payment?.date}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={isErrorDialogOpen} onClose={() => setIsErrorDialogOpen(false)}>
        <DialogContent sx={{ width: 400 }}>
          <div>{paymentErrorMessage}</div>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PaymentPage;
