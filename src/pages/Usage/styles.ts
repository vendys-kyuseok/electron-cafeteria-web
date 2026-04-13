import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';

export const SearchContainer = styled(Box)`
  display: flex;
  height: 56px;
  padding: 4px 4px 4px 8px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: #46b476;

  .search-header {
    display: flex;
    align-items: center;
    width: 120px;
    padding: 8px 16px 8px 8px;
    ${({ theme }) => theme.typography.font20B}
    color: ${({ theme }) => theme.color.white};
  }
  .search-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0px 8px;
    border-radius: 10px;
    font-weight: 700;
    background: #3b9964;
    color: ${({ theme }) => theme.color.white};
  }
`;

export const DateButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  min-width: 42px;
  height: 42px;
  border-radius: 4px;
  background: #fff;
  color: #3b9964;

  .MuiButton-icon.MuiButton-startIcon {
    margin: 0;
  }
`;
export const NextDateButton = styled(DateButton)``;
export const PrevDateButton = styled(DateButton)``;
export const TodayDateButton = styled(DateButton)`
  width: 48px;
  min-width: 48px;
  height: 32px;
  padding: 0px;
  font-weight: 700;
  color: #4c5966;
`;
