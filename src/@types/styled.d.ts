import '@emotion/react';
import '@mui/material/styles';
import type { Theme as MuiTheme } from '@mui/material/styles';
import type { CSSObject } from '@emotion/react';

import { color, typography } from '@styles/theme';

type AppColorTokens = typeof color;
type AppTypographyTokens = typeof typography;
type AppTypographyTokenKey = keyof AppTypographyTokens;

declare module '@mui/material/styles' {
  interface TypographyVariants extends Record<AppTypographyTokenKey, CSSObject> {}
  interface TypographyVariantsOptions extends Partial<Record<AppTypographyTokenKey, CSSObject>> {}

  interface Theme {
    color: AppColorTokens;
  }
  interface ThemeOptions {
    color?: Partial<AppColorTokens>;
  }
}

declare module '@emotion/react' {
  interface Theme extends MuiTheme {}
}
