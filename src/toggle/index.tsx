import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import Structure from "common/components/structure";
import { getStorageValue } from "utils/browser-helpers";
import { PopupMessage } from "utils/types";

import LogoEnabled from "assets/icons/abf-enabled-128.png";
import LogoDisabled from "assets/icons/abf-disabled-128.png";

const App = () => {
  const [useEnabledSrc, setUseEnabledSrc] = useState<boolean>(false);

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

  return (
    <Structure>
      <img
        css={css`
          width: 48px;
          height: 48px;
        `}
        src={useEnabledSrc ? LogoEnabled : LogoDisabled}
        alt="abf-logo"
      />
    </Structure>
  );
};

const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
