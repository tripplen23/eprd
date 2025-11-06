"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ClientWrapper } from "@/components/wrapper/client-wrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ClientWrapper>{children}</ClientWrapper>
    </Provider>
  );
}