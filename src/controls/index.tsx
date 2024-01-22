import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";

import Structure from "common/components/structure";
import { FlashMessageProvider } from "common/context/use-flash-message";
import { SettingsProvider } from "controls/context/use-settings";

const Controls = React.lazy(() => import("controls/components/controls"));
const FlashMessage = React.lazy(() => import("common/components/flash-message"));

const App = () => {
  return (
    <Structure>
      <SettingsProvider>
        <FlashMessageProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Controls />
            <FlashMessage />
          </Suspense>
        </FlashMessageProvider>
      </SettingsProvider>
    </Structure>
  );
};

const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
