import { useState, useEffect } from 'react';

// Custom Alert Component
export function useAlert() {
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = 'info') => {
        setAlert({ message, type });
    };

    const AlertComponent = () => {
        if (!alert) return null;

        const icons = {
            success: 'ph-check-circle',
            error: 'ph-x-circle',
            warning: 'ph-warning',
            info: 'ph-info',
        };

        const colors = {
            success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            error: 'text-rose-600 bg-rose-50 border-rose-200',
            warning: 'text-amber-600 bg-amber-50 border-amber-200',
            info: 'text-blue-600 bg-blue-50 border-blue-200',
        };

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform animate-fade-in">
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${colors[alert.type]}`}>
                            <i className={`ph ${icons[alert.type]} text-4xl`}></i>
                        </div>
                        <p className="text-slate-800 text-lg mb-6">{alert.message}</p>
                        <button
                            onClick={() => setAlert(null)}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return { showAlert, AlertComponent };
}

// Custom Confirm Component
export function useConfirm() {
    const [confirm, setConfirm] = useState(null);

    const showConfirm = (message, onConfirm, onCancel) => {
        setConfirm({ message, onConfirm, onCancel });
    };

    const handleConfirm = () => {
        if (confirm?.onConfirm) confirm.onConfirm();
        setConfirm(null);
    };

    const handleCancel = () => {
        if (confirm?.onCancel) confirm.onCancel();
        setConfirm(null);
    };

    const ConfirmComponent = () => {
        if (!confirm) return null;

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform animate-fade-in">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-200">
                            <i className="ph ph-warning text-4xl text-amber-600"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi</h3>
                        <p className="text-slate-600">{confirm.message}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all"
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return { showConfirm, ConfirmComponent };
}
