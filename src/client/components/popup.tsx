import { css } from '@emotion/react';
import { FormControl, FormControlLabel, Radio, RadioGroup, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useSettings } from 'client/context/settings';
import { getEngineApi, sendMessageToContent, setIcon, setStorageValue } from 'utils/browser-helpers';
import { BackgroundMessage, StorageSettings } from 'utils/types';
import { useEffect } from 'react';

export const Popup = () => {
  const { t } = useTranslation();
  const { settings, setAll } = useSettings();
  console.log({ settings });

  const messageListener = (message: BackgroundMessage) => {
    if (message.type === "storageChanged") {
      setAll();
    }
  };

  useEffect(() => {
    const port = getEngineApi().runtime.connect({ name: 'popup' });
    port.onMessage.addListener(messageListener);

    return () => {
      port.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleChange = <K extends keyof StorageSettings>(
    key: K
  ) => (
    value: StorageSettings[K]
  ) => async () => {
    const payload = { [key]: value };
    await setStorageValue(payload, "sync");
    await setStorageValue(payload);
    sendMessageToContent({ type: key, isChecked: typeof value === "boolean" ? value : true });
  };
  
  return (
    <div
      css={css`
        width: 25rem;
        font-size: 16px;
        font-weight: normal;
        padding: 8px 16px;
      `}
    >
      <FormControl>
        <FormControlLabel
          control={
            <Switch 
              size="small" 
              checked={settings.enabled} 
              onChange={async () => {
                await handleChange('enabled')(!settings.enabled)();
                await setIcon();
              }} 
            />
          }
          label={t('popup_enabled.message')}
        />
        <FormControlLabel
          control={
            <Switch 
              size="small" 
              checked={settings.filterRefiner} 
              onChange={handleChange('filterRefiner')(!settings.filterRefiner)} 
            />
          }
          label={t('popup_filter_sidebar.message')}
        />
        <RadioGroup
          row
          aria-labelledby="popup-radio-buttons-group-label"
          name="popup-radio-buttons-group"
        >
          <FormControlLabel 
            control={
              <Radio 
                checked={settings.refinerMode === "hide"} 
                onChange={handleChange('refinerMode')('hide')} 
              />
            } 
            label={t('popup_sidebar_hide.message')} 
          />
          <FormControlLabel 
            control={
              <Radio 
                checked={settings.refinerMode === "grey"} 
                onChange={handleChange('refinerMode')('grey')} 
              />
            } 
            label={t('popup_sidebar_grey.message')}
          />
        </RadioGroup>
        <FormControlLabel
          control={
            <Switch 
              size="small" 
              checked={settings.refinerBypass} 
              onChange={handleChange('refinerBypass')(!settings.refinerBypass)} 
            />
          }
          label={t('popup_allow_refine_bypass.message')}
        />
        <FormControlLabel
          control={
            <Switch 
              size="small" 
              checked={settings.useDebugMode} 
              onChange={handleChange('useDebugMode')(!settings.useDebugMode)}
            />
          }
          label={t('popup_debug.message')}
        />
        <FormControlLabel
          control={
            <Switch 
              size="small" 
              checked={settings.usePersonalBlock} 
              onChange={handleChange('usePersonalBlock')(!settings.usePersonalBlock)}
            />
          }
          label={t('popup_personal_blocklist.message')}
        />
      </FormControl>
    </div>
  );
};
