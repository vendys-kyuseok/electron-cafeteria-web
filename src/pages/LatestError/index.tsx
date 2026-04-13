import { BasicTable, type TColumn } from '@components';
import { Box } from '@mui/material';
import { getLocalStorage } from '@utils/storageUtils';
import styled from '@emotion/styled';

import dayjs from 'dayjs';

const PageWhiteBox = styled(Box)`
  height: calc(100vh - 75px - 56px);
  padding: 8px;
  border-radius: 10px;
  background: ${({ theme }) => theme.color.white};

  .latest-description {
    padding: 8px 4px;
    border-radius: 10px;
    background: ${({ theme }) => theme.color.white};
    color: ${({ theme }) => theme.color.gray04};
    ${({ theme }) => theme.typography.font14B};
  }
  .latest-content {
    height: calc(100% - 34px);
  }
`;

type LatestErrorItem = { useDate: string; barcode: string; errorContent: string };

const columns: TColumn<LatestErrorItem>[] = [
  { field: 'useDate', headerName: '에러 일시', cellRenderer: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss') },
  { field: 'barcode', headerName: '바코드 정보' },
  { field: 'errorContent', headerName: '에러 응답' }
];

const LatestErrorPage = () => {
  const errors = getLocalStorage('latestErrors');
  return (
    <Box sx={{ padding: '0px 8px 8px' }}>
      <PageWhiteBox>
        <Box className="latest-description">※ 최근 결제 실패 이력 5건의 상세 로그를 확인하는 페이지입니다.</Box>
        <Box className="latest-content">
          <BasicTable columns={columns} data={errors || []} />
        </Box>
      </PageWhiteBox>
    </Box>
  );
};

export default LatestErrorPage;
