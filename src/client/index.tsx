import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';

import { Popup } from 'client/components/popup';
import { SettingsProvider } from 'client/context/settings';

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
