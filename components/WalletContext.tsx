"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import WalletModal from "./WalletModal";

interface WalletContextType {
    openWalletModal: () => void;
    closeWalletModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openWalletModal = () => setIsOpen(true);
    const closeWalletModal = () => setIsOpen(false);

    return (
        <WalletContext.Provider value={{ openWalletModal, closeWalletModal }}>
            {children}
            <WalletModal open={isOpen} onClose={closeWalletModal} />
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
