import { css } from '@emotion/react';
import { Alert } from '@mui/material';
import { useFlashMessage } from 'popup/context/use-flash-message';

export const FlashMessage = () => {
  const { severity = "info", message } = useFlashMessage();

  if (!message) {
    return null;
  }

  return (
    <div
      css={css`
        position: fixed;
        bottom: 0.4rem;
        left: 0.4rem;
        right: 0.4rem;
        width: calc(100% - 0.8rem);
      `}
    >
      <Alert severity={severity}>{message}</Alert>
    </div>
  );
};
