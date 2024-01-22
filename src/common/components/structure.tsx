import "i18n/config";

import React, { useEffect, useState } from "react";
import createTheme from "@mui/material/styles/createTheme";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import useMediaQuery from "@mui/material/useMediaQuery";

import { ColorModeProvider } from "common/context/use-color-mode";
import { ColorMode } from "utils/types";
import { getStorageValue, setStorageValue } from "utils/browser-helpers";

const Structure = ({ children }: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<ColorMode>(prefersDarkMode ? "dark" : "light");

  const getStorageColorMode = async () => {
    const result = await getStorageValue("colorMode");
    if (result.colorMode) {
      setMode(result.colorMode);
    } else {
      await setStorageValue({ colorMode: mode });
    }
  };

  useEffect(() => {
    getStorageColorMode();
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  return (
    <ColorModeProvider mode={mode} setMode={setMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeProvider>
  );
};

export default Structure;
