import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';

import { Controls } from 'popup/components/controls';
import { FlashMessage } from 'popup/components/flash-message';
import { FlashMessageProvider } from 'popup/context/use-flash-message';
import { SettingsProvider } from 'popup/context/use-settings';

import 'i18n';

const App = () => {
  return (
    <>
      <CssBaseline />
      <SettingsProvider>
        <FlashMessageProvider>
          <Controls/>
          <FlashMessage />
        </FlashMessageProvider>
      </SettingsProvider>
    </>
  )
};

const root = createRoot(document.getElementById('app') as HTMLElement);
root.render(<App/>);
