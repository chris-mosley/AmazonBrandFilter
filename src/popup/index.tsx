import { css } from "@emotion/react";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";

import Structure from "common/components/structure";
import { getManifest, getStorageValue } from "utils/browser-helpers";
import { PopupMessage } from "utils/types";

import LogoEnabled from "assets/icons/abf-enabled-128.png";
import LogoDisabled from "assets/icons/abf-disabled-128.png";

const App = () => {
  const { t } = useTranslation();

  const [useEnabledSrc, setUseEnabledSrc] = useState<boolean>(false);
  const [manifestVersion, setManifestVersion] = useState<string>("");

  const handleSetImageSrc = async () => {
    const result = await getStorageValue("enabled");
    setUseEnabledSrc(result.enabled);
  };

  const messageListener = (event: MessageEvent) => {
    const message: PopupMessage = event.data;
    if (message.type === "enabled") {
      handleSetImageSrc();
    }
  };

  useEffect(() => {
    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  useEffect(() => {
    handleSetImageSrc();
  }, []);

  useEffect(() => {
    const manifest = getManifest();
    setManifestVersion(manifest.version);
  }, []);

  return (
    <Structure>
      <div
        css={css`
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 1;

          font-size: 0.8rem;
          font-weight: bold;
          color: grey;
        `}
      >
        {`v${manifestVersion}`}
      </div>
      <div
        css={css`
          width: 25rem;
          padding: 8px 16px;

          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        `}
      >
        <Typography variant="h5">{t("introduction.message")}</Typography>
        <Typography variant="body1">{t("introduction.description")}</Typography>
        <img
          css={css`
            width: 48px;
            height: 48px;
          `}
          src={useEnabledSrc ? LogoEnabled : LogoDisabled}
          alt="abf-logo"
        />
      </div>
    </Structure>
  );
};

const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
