import { Dispatch, SetStateAction, createContext, useContext, useMemo } from "react";

import { ColorMode } from "popup/utils/types";

const ColorModeContext = createContext({} as {
  mode: ColorMode;
  toggleMode: () => void;
});

interface ColorModeProviderProps {
  mode: ColorMode;
  setMode: Dispatch<SetStateAction<ColorMode>>;
  children: React.ReactNode;
}

const ColorModeProvider = ({ mode, setMode, children }: ColorModeProviderProps) => {
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  
  const value = useMemo(() => ({
    mode,
    toggleMode,
  }), [
    mode,
    toggleMode,
  ]);

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
};

const useColorMode = () => useContext(ColorModeContext);

export { ColorModeProvider, useColorMode };
