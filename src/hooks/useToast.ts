import { useState, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

interface ToastData {
    id: string;
    type: ToastType;
    message: string;
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message: string) => {
        showToast('success', message);
    }, [showToast]);

    const showError = useCallback((message: string) => {
        showToast('error', message);
    }, [showToast]);

    const showWarning = useCallback((message: string) => {
        showToast('warning', message);
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast('info', message);
    }, [showToast]);

    return {
        toasts,
        dismissToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}
