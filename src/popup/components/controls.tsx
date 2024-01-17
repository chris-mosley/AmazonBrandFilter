import { css } from '@emotion/react';
import { 
  Alert,
  Button, 
  FormControl, 
  FormControlLabel, 
  InputAdornment, 
  Link, 
  Radio, 
  RadioGroup, 
  Switch, 
  TextField, 
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettings } from 'popup/context/use-settings';
import { getEngineApi, getManifest, sendMessageToContentScript, setIcon, setStorageValue } from 'utils/browser-helpers';
import { BackgroundMessage, StorageSettings } from 'utils/types';
import { getSanitizedUserInput } from 'utils/helpers';

const Controls = () => {
  const { t } = useTranslation();
  const { settings, setAll } = useSettings();

  const [manifestVersion, setManifestVersion] = useState<string>("");
  const [personalBlockText, setPersonalBlockText] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  console.log(settings);

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

  useEffect(() => {
    const manifest = getManifest();
    setManifestVersion(manifest.version);
  }, []);

  useEffect(() => {
    setPersonalBlockText(Object.keys(settings.personalBlockMap).join("\n"));
  }, [settings.personalBlockMap]);

  useEffect(() => {
    if (!settings.allResultsFiltered) {
      setAlertMessage("");
      return;
    }
    setAlertMessage(t('popup_all_results_filtered.message'));
  }, [settings.allResultsFiltered]);

  const handleChange = <K extends keyof StorageSettings>(
    key: K
  ) => (
    value: StorageSettings[K]
  ) => async () => {
    const payload = { [key]: value };
    await setStorageValue(payload, "sync");
    await setStorageValue(payload);
    sendMessageToContentScript({ type: key, isChecked: typeof value === "boolean" ? value : true });
  };

  const handleSavePersonalBlock = async () => {
    const userInput = getSanitizedUserInput(personalBlockText);
    const personalBlockMap: Record<string, boolean> = {};
    for (const brand of userInput) {
      personalBlockMap[brand] = true;
    }
    await setStorageValue({ personalBlockMap }, "sync");
    await setStorageValue({ personalBlockMap });
    sendMessageToContentScript({ type: "personalBlockMap", isChecked: settings.usePersonalBlock });
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
      <div
        css={css`
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.8rem;
          font-weight: bold;
          color: grey;
        `}
      >
        {`v${manifestVersion}`}
      </div>
      <FormControl sx={{ width: '100%' }}>
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
        <div
          css={css`
            margin-top: 0.5rem;
            margin-left: 1.3rem;
            display: ${settings.usePersonalBlock ? "block" : "none"};
          `}
        >
          <TextField 
            multiline 
            minRows="1" 
            sx={{ width: '100%' }}
            size="small"
            variant="outlined" 
            label={t('popup_personal_blocklist.description')}
            value={personalBlockText}
            onChange={(e) => setPersonalBlockText(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSavePersonalBlock}
                >
                  {t('popup_save_button.message')}
                </Button>
              </InputAdornment>,
            }}
          />
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 4px;
          `}
        >
          <div>
            {`${t('popup_list_version.message')}${settings.brandsVersion}`}
          </div>
          <div>|</div>
          <div>
            {`${t('popup_list_count.message')}${settings.brandsCount}`}
          </div>
        </div>
        <div
          css={css`
            display: flex;
            align-items: flex-start;
            flex-direction: column;
          `}
        >
          <Link 
            href="https://github.com/chris-mosley/AmazonBrandFilter/issues" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('popup_feedback_link.message')}
          </Link>
          <Link 
            href="https://github.com/chris-mosley/AmazonBrandFilterList#missing-a-brand"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('popup_missing_brand.message')}
          </Link>
          <Link 
            href="https://github.com/chris-mosley/AmazonBrandFilter#help-translate"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('popup_help_translate.message')}
          </Link>
        </div>
      </FormControl>
      
      {alertMessage && (
        <div
          css={css`
            margin: 0.4rem;
            width: calc(100% - 0.8rem);
          `}
        >
          <Alert 
            severity="info"
          >
            {alertMessage}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Controls;
