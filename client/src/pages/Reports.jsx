import { formatRupiah } from '../lib/utils';

export default function Reports() {
    const transactions = [
        {
            invoiceNo: 'INV-2025-001',
            date: '14 Des 2024',
            cashier: 'Kasir 1',
            total: 223000,
            method: 'CASH',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl text-slate-800">Laporan Transaksi</h2>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center gap-2">
                    <i className="ph ph-download text-lg"></i> Export PDF
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold">
                            <tr>
                                <th className="px-4 py-3">No. Invoice</th>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Kasir</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-center">Metode</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions.map((trx, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-xs bg-slate-100">{trx.invoiceNo}</td>
                                    <td className="px-4 py-3 text-slate-700">{trx.date}</td>
                                    <td className="px-4 py-3 text-slate-600">{trx.cashier}</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                                        {formatRupiah(trx.total)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">
                                            {trx.method}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button className="text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50">
                                            <i className="ph ph-eye"></i>
                                        </button>
                                        <button className="text-slate-600 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-50">
                                            <i className="ph ph-printer"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
