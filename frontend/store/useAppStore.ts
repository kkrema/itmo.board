import React, {createContext, ReactNode, useState} from 'react';

interface AppState {
    user: string | null;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);

    return <AppContext.Provider value={{ user, setUser }}>{children}</AppContext.Provider>;
};
