import styled from '@emotion/styled';
import { Box } from '@mui/material';

export interface FlexBoxProps {
  direction?: 'row' | 'column' | 'row-revers' | 'column-revers' | 'initial' | 'inherit' | 'unset';
  justify?:
    | 'baseline'
    | 'center'
    | 'end'
    | 'first baseline'
    | 'flex-start'
    | 'flex-end'
    | 'last baseline'
    | 'left'
    | 'right'
    | 'safe'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
    | 'start'
    | 'stretch'
    | 'initial'
    | 'inherit'
    | 'unset';
  align?: 'baseline' | 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'initial' | 'inherit' | 'unset';
  gap?: string | number;
}

export const FlexBoxFullWidthCenter = styled(Box)<FlexBoxProps>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  justify-content: ${({ justify }) => justify};
  align-items: ${({ align }) => align ?? 'center'};
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : gap)};
  width: 100%;
`;

export const FlexBoxCenter = styled(Box)<FlexBoxProps>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  justify-content: ${({ justify }) => justify};
  align-items: ${({ align }) => align ?? 'center'};
  gap: ${({ gap }) => gap};
`;
