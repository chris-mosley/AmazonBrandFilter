import { Dispatch, SetStateAction, createContext, useContext, useMemo } from "react";

import { setStorageValue } from "utils/browser-helpers";
import { ColorMode } from "utils/types";

const ColorModeContext = createContext(
  {} as {
    mode: ColorMode;
    toggleMode: () => void;
  }
);

interface ColorModeProviderProps {
  mode: ColorMode;
  setMode: Dispatch<SetStateAction<ColorMode>>;
  children: React.ReactNode;
}

const ColorModeProvider = ({ mode, setMode, children }: ColorModeProviderProps) => {
  const toggleMode = async () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    await setStorageValue({ colorMode: newMode });
  };

  const value = useMemo(
    () => ({
      mode,
      toggleMode,
    }),
    [mode, toggleMode]
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
};

const useColorMode = () => useContext(ColorModeContext);

export { ColorModeProvider, useColorMode };
