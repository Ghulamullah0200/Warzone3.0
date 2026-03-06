'use client';

import { createContext, useContext } from 'react';


interface DashboardContextType {
    openDepositModal: () => void;
    closeDepositModal: () => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    userBalance: number;
    refreshUser: () => void;
}

export const DashboardContext = createContext<DashboardContextType>({
    openDepositModal: () => { },
    closeDepositModal: () => { },
    showNotification: () => { },
    userBalance: 0,
    refreshUser: () => { },
});

export const useDashboard = () => useContext(DashboardContext);
