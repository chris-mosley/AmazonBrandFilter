import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';

import { Popup } from 'popup/components/popup';
import { SettingsProvider } from 'popup/context/settings';

import 'i18n';

const App = () => {
  return (
    <>
      <CssBaseline />
      <SettingsProvider>
        <Popup/>
      </SettingsProvider>
    </>
  )
};

const root = createRoot(document.getElementById('app') as HTMLElement);
root.render(<App/>);
