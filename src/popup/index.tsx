import 'i18n';

import React, { Suspense } from 'react';
import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';

import { FlashMessageProvider } from 'popup/context/use-flash-message';
import { SettingsProvider } from 'popup/context/use-settings';

const Controls = React.lazy(() => import('popup/components/controls'));
const FlashMessage = React.lazy(() => import('popup/components/flash-message'));

const App = () => {
  return (
    <>
      <CssBaseline />
      <SettingsProvider>
        <FlashMessageProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Controls/>
            <FlashMessage />
          </Suspense>
        </FlashMessageProvider>
      </SettingsProvider>
    </>
  )
};

const root = createRoot(document.getElementById('app') as HTMLElement);
root.render(<App/>);
