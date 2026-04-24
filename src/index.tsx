/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { StyledEngineProvider, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { globalStyleCss } from '@styles/globalStyle';
import { theme } from '@styles/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0
    }
  }
});

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <Suspense fallback={<></>}>
        {/* 스타일 우선순위 결정을 위해 최상단 배치 */}
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            {/* 전역 스타일은 테마 변수를 쓸 수 있도록 테마 아래에 배치 */}
            <GlobalStyles styles={globalStyleCss} />
            {/* 스낵바는 테마와 스타일이 적용된 후의 UI 요소임 */}
            <SnackbarProvider autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} maxSnack={3}>
              <App />
            </SnackbarProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </Suspense>
    </HashRouter>
  </QueryClientProvider>
  // </StrictMode>
);
