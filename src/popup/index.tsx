import 'i18n';

import React, { Suspense, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { createRoot } from 'react-dom/client';

import { FlashMessageProvider } from 'popup/context/use-flash-message';
import { SettingsProvider } from 'popup/context/use-settings';
import { ColorModeProvider } from 'popup/context/use-color-mode';
import { ColorMode } from 'popup/utils/types';

const Controls = React.lazy(() => import('popup/components/controls'));
const FlashMessage = React.lazy(() => import('popup/components/flash-message'));

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<ColorMode>(prefersDarkMode ? 'dark' : 'light');
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  return (
    <ColorModeProvider mode={mode} setMode={setMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SettingsProvider>
          <FlashMessageProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Controls/>
              <FlashMessage />
            </Suspense>
          </FlashMessageProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ColorModeProvider>
  )
};

const root = createRoot(document.getElementById('app') as HTMLElement);
root.render(<App/>);
