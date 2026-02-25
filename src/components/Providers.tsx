"use client";

import { SessionProvider } from "next-auth/react";
import { HeaderAuth } from "./ui/HeaderAuth";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <HeaderAuth />
            {children}
        </SessionProvider>
    );
}
