/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useGetCafeteriaSalesHistory,
  useGetCafeteriaStats,
  type CafeteriaStatsParams,
  type CafeteriaSalesHistoryParams
} from '@hooks/cafeteria';
import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getLocalStorage } from '@utils/storageUtils';

import { SearchContainer, NextDateButton, PrevDateButton, TodayDateButton } from './styles';
import { LoadingOverlay, BasicTable, TColumn } from '@components';

const columns: TColumn<any>[] = [
  { field: 'usedate', headerName: '결제 일시', cellRenderer: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss') },
  { field: 'comName', headerName: '회사명' },
  { field: 'signId', headerName: '사용자 ID' },
  { field: 'name', headerName: '사용자명' },
  { field: 'menuname', headerName: '메뉴명' },
  {
    field: 'price',
    headerName: '메뉴 금액',
    cellRenderer: (value) => <Box sx={{ textAlign: 'end', fontWeight: 700, color: '#1db53a' }}>{Number(value || 0).toLocaleString()}</Box>
  }
];

const UsagePage = () => {
  const cafeteria = getLocalStorage('cafeteria');

  const [selectedDate, setSelectedDate] = useState<string>(dayjs('2026-02-10').format('YYYY-MM-DD'));

  // 월단위 매출 통계 상세
  const statsParams: CafeteriaStatsParams = useMemo(() => {
    return {
      startDate: dayjs(selectedDate).startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs(selectedDate).endOf('month').format('YYYY-MM-DD'),
      month: dayjs(selectedDate).format('YYYYMM'),
      kind: 'DATE',
      dateKey: selectedDate
    };
  }, [selectedDate]);
  const { data: cafeteriaStats, isLoading: isStatsLoading } = useGetCafeteriaStats(cafeteria?.storeId, statsParams);

  // 구내식당 매출 내역
  const salesHistoryParams: CafeteriaSalesHistoryParams = useMemo(() => {
    return {
      date: selectedDate,
      paging: false,
      dateKey: selectedDate
    };
  }, [selectedDate]);
  const { data: salesHistory, isLoading: isSalesLoading } = useGetCafeteriaSalesHistory(cafeteria?.storeId, salesHistoryParams);

  const handlePrevDate = () => setSelectedDate(dayjs(selectedDate).add(-1, 'day').format('YYYY-MM-DD'));
  const handleNextDate = () => setSelectedDate(dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD'));
  const handleTodayDate = () => setSelectedDate(dayjs().format('YYYY-MM-DD'));

  const monthlyTotalCount = cafeteriaStats?.rows.reduce((cur: number, pre: any) => (cur += pre?.payCount), 0);
  const monthlyTotalPrice = cafeteriaStats?.rows.reduce((cur: number, pre: any) => (cur += pre?.totalPrice), 0);

  const salesTotalPrice = salesHistory?.sales?.reduce((cur: number, pre: any) => (cur += pre?.price), 0);

  const isAfter = !dayjs().isAfter(dayjs(selectedDate), 'day');

  const currentMonth = dayjs(selectedDate).month() + 1;

  return (
    <Box sx={{ padding: '0px 8px 8px', position: 'relative' }}>
      <LoadingOverlay open={isStatsLoading && isSalesLoading} />
      <SearchContainer>
        <Box className="search-header">조회기간</Box>
        <Box className="search-content">
          <PrevDateButton startIcon={<ArrowBackIosNewIcon sx={{ paddingRight: '2px' }} />} onClick={handlePrevDate} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', paddingLeft: '24px' }}>
            <CalendarMonthIcon />
            <div>{dayjs(selectedDate).format('YYYY-MM-DD')}</div>
            <TodayDateButton onClick={handleTodayDate}>오늘</TodayDateButton>
          </Box>
          <NextDateButton startIcon={<ArrowForwardIosIcon sx={{ paddingLeft: '2px' }} />} disabled={isAfter} onClick={handleNextDate} />
        </Box>
      </SearchContainer>

      <Box sx={{ display: 'flex', gap: '8px', width: '100%', paddingBottom: '8px' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: 'calc(100% - 20px)',
            maxWidth: '300px',
            height: '52px',
            padding: '8px 10px',
            borderRadius: '10px',
            background: '#ffffff'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '120px' }}>
            <Box sx={{ paddingBottom: '4px', fontSize: '12px', fontWeight: '700', color: '#4c5966' }}>검색 결과</Box>
            <Box sx={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', color: '#4c5966' }}>
              <span>{salesHistory?.totalCount || 0}</span>
              <span style={{ fontSize: 18 }}>건</span>
            </Box>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ paddingBottom: '4px', fontSize: '12px', fontWeight: '700', color: '#4c5966' }}>검색 결과</Box>
            <Box sx={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', color: '#4c5966' }}>
              <span>{Number(salesTotalPrice || 0)?.toLocaleString()}</span>
              <span style={{ fontSize: 18 }}>원</span>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            width: 'calc(100% - 20px)',
            maxWidth: '300px',
            height: '52px',
            padding: '8px 10px',
            borderRadius: '10px',
            background: '#ffffff'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '120px' }}>
            <Box sx={{ paddingBottom: '4px', fontSize: '12px', fontWeight: '700', color: '#4c5966' }}>{currentMonth}월 총 결제 수</Box>
            <Box sx={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', color: '#4c5966' }}>
              <span>{monthlyTotalCount || 0}</span>
              <span style={{ fontSize: 18 }}>건</span>
            </Box>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ paddingBottom: '4px', fontSize: '12px', fontWeight: '700', color: '#4c5966' }}>{currentMonth}월 총 합계 금액</Box>
            <Box sx={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', color: '#4c5966' }}>
              <span>{Number(monthlyTotalPrice || 0)?.toLocaleString()}</span>
              <span style={{ fontSize: 18 }}>원</span>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          height: 'calc(100vh - 282px)',
          padding: '8px',
          borderRadius: '10px',
          background: '#ffffff'
        }}
      >
        <BasicTable columns={columns} data={salesHistory?.sales} />
      </Box>
    </Box>
  );
};

export default UsagePage;
