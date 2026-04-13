import { createTheme } from '@mui/material/styles';
import type { Theme, TypographyVariantsOptions } from '@mui/material/styles';

const color = {
  primary: '#1DB53A',
  white: '#FFFFFF',
  black: '#212529',
  red: '#FF3B3E',
  bgBlack: '#252525',
  bgBlue: '#343b45',
  bgOverlay: '#00000052',
  bgGray: '#e1e4e6',
  bgGreen01: '#46b476',
  bgGreen02: '#3b9964',
  gray01: '#f3f5f6',
  gray02: '#dddddd',
  gray03: '#cccccc',
  gray04: '#474747',
  gray05: '#333333'
};

const typography = {
  font12B: { fontSize: '12px', fontWeight: 700 },
  font12R: { fontSize: '12px', fontWeight: 500 },
  font14B: { fontSize: '14px', fontWeight: 700 },
  font14R: { fontSize: '14px', fontWeight: 500 },
  font16B: { fontSize: '16px', fontWeight: 700 },
  font16R: { fontSize: '16px', fontWeight: 500 },
  font18B: { fontSize: '18px', fontWeight: 700 },
  font18R: { fontSize: '18px', fontWeight: 500 },
  font20B: { fontSize: '20px', fontWeight: 700 },
  font20R: { fontSize: '20px', fontWeight: 500 },
  font24B: { fontSize: '24px', fontWeight: 700 },
  font24R: { fontSize: '24px', fontWeight: 500 },
  font26B: { fontSize: '26px', fontWeight: 700 },
  font26R: { fontSize: '26px', fontWeight: 500 },
  font28B: { fontSize: '28px', fontWeight: 700 },
  font28R: { fontSize: '28px', fontWeight: 500 },
  font32B: { fontSize: '32px', fontWeight: 700 },
  font32R: { fontSize: '32px', fontWeight: 500 }
};
const typographyTheme = { ...typography } satisfies TypographyVariantsOptions;

const theme: Theme = createTheme({
  color,
  typography: typographyTheme,
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      },
      styleOverrides: {
        root: { ...typography.font14R }
      }
    }
  },
  palette: {
    primary: { main: color.primary, contrastText: '#FFFFFF' }
  }
});

export default theme;
export { theme, color, typography };
