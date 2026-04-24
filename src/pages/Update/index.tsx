import { LoadingOverlay } from '@components';
import { useAppUpdate } from '@hooks/update';
import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';
import { FlexBoxCenter } from '@styles';
import dayjs from 'dayjs';

const DownloadAssetCard = styled(FlexBoxCenter)`
  padding: 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.color.white};
`;
const DefaultChip = styled(Box)`
  padding: 2px 4px;
  border-radius: 4px;
  background: ${({ theme }) => theme.color.bgGray};
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.bgOverlay};
`;
const LatestChip = styled(DefaultChip)`
  border: 1px solid ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.white};
  ${({ theme }) => theme.typography.font12B}
  color: ${({ theme }) => theme.color.primary};
`;

const UpdatePage = () => {
  const { releases, isLoading, downloadAsset, downloadState } = useAppUpdate();
  console.log('##### downloadState:', downloadState);

  return (
    <Box sx={{ padding: '0px 8px 8px' }}>
      <LoadingOverlay open={isLoading} />
      <Box>
        {releases.map((release, index) => (
          <DownloadAssetCard justify="space-between">
            <Box>
              <FlexBoxCenter gap="8px" sx={{ paddingBottom: '8px' }}>
                <Box sx={{ fontSize: '18px', fontWeight: '700' }}>{release.releaseName}</Box>
                {index === 0 ? <LatestChip>최신 버전</LatestChip> : null}
              </FlexBoxCenter>
              <FlexBoxCenter gap="8px">
                <DefaultChip>{dayjs(release.publishedAt).format('YYYY-MM-DD')}</DefaultChip>
                <DefaultChip>v{release.version}</DefaultChip>
              </FlexBoxCenter>
            </Box>
            <Button onClick={() => downloadAsset(release.releaseId, release.assets[0].assetId)}>업데이트</Button>
          </DownloadAssetCard>
        ))}
      </Box>
    </Box>
  );
};

export default UpdatePage;
