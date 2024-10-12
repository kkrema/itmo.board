import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
    user: string | null;
    setUser: (user: string | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);

    return (
        <AppContext.Provider value={{ user, setUser }}>
    {children}
    </AppContext.Provider>
);
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppStore must be used within an AppProvider");
    }
    return context;
};
