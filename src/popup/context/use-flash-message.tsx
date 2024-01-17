import { AlertProps } from "@mui/material";
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useMemo, useState } from "react";

const FlashMessageContext = createContext({
  message: undefined,
  severity: undefined,
  setMessage: () => Promise.resolve(),
  setSeverity: () => Promise.resolve(),
} as {
  message: string | undefined;
  severity: AlertProps['severity'];
  setMessage: Dispatch<SetStateAction<string | undefined>>; 
  setSeverity: Dispatch<SetStateAction<AlertProps['severity'] | undefined>>;
});

interface FlashMessageProviderProps {
  children: React.ReactNode;
}

const FlashMessageProvider = ({ children }: FlashMessageProviderProps) => {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [severity, setSeverity] = useState<AlertProps['severity'] | undefined>(undefined);

  // auto hide message after 3 seconds
  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage(undefined);
        setSeverity(undefined);
      }, 3000);
    }
  }, [message]);

  const value = useMemo(() => ({
    message,
    severity,
    setMessage,
    setSeverity,
  }), [
    message,
    severity,
    setMessage,
    setSeverity,
  ]);

  return (
    <FlashMessageContext.Provider value={value}>
      {children}
    </FlashMessageContext.Provider>
  );
};

const useFlashMessage = () => useContext(FlashMessageContext);

export { FlashMessageProvider, useFlashMessage };
