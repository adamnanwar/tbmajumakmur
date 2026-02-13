import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAlert } from '../components/common/CustomDialogs';
import { productsAPI } from '../lib/api';

export default function SlowMoving() {
    const [period, setPeriod] = useState(30);
    const [threshold, setThreshold] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    const { showAlert, AlertComponent } = useAlert();

    // Fetch slow moving products from API
    const { data: slowMovingData, isLoading, refetch } = useQuery({
        queryKey: ['slowMoving', period, threshold],
        queryFn: async () => {
            const response = await productsAPI.getSlowMoving({ period, threshold });
            return response.data;
        },
    });

    const products = slowMovingData?.data || [];

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApplyFilter = () => {
        refetch();
        showAlert('Filter berhasil diterapkan!', 'success');
    };

    const handleExport = () => {
        const csvContent = [
            ['SKU', 'Nama Produk', 'Kategori', 'Stok', 'Terjual (' + period + ' Hari)', 'Harga Jual', 'Nilai Stok'],
            ...filtered.map((p) => [
                p.sku,
                p.name,
                p.category?.name || '-',
                p.stock,
                p.totalSold || 0,
                p.sellPrice,
                p.stock * p.sellPrice,
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `slow_moving_${period}days_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        showAlert('Data slow moving berhasil diekspor!', 'success');
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center h-96">
                <div className="text-center">
                    <i className="ph ph-spinner text-6xl text-blue-600 animate-spin"></i>
                    <p className="mt-4 text-slate-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Analisa Slow Moving</h1>
                    <p className="text-slate-600 mt-1">Produk dengan perputaran lambat</p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg"
                >
                    <i className="ph ph-download text-xl"></i>
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <i className="ph ph-calendar mr-1"></i>
                            Periode Analisis
                        </label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={7}>7 Hari Terakhir</option>
                            <option value={30}>30 Hari Terakhir</option>
                            <option value={60}>60 Hari Terakhir</option>
                            <option value={90}>90 Hari Terakhir</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <i className="ph ph-chart-line mr-1"></i>
                            Threshold Penjualan
                        </label>
                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <i className="ph ph-magnifying-glass mr-1"></i>
                            Cari Produk
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nama/SKU..."
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleApplyFilter}
                            className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg"
                        >
                            <i className="ph ph-funnel mr-2"></i>
                            Terapkan Filter
                        </button>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                    <i className="ph ph-info mr-1"></i>
                    Menampilkan produk dengan penjualan <strong>&lt; {threshold} unit</strong> dalam{' '}
                    <strong>{period} hari</strong> terakhir
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Produk Slow Moving</p>
                            <p className="text-3xl font-bold mt-1">{filtered.length}</p>
                        </div>
                        <i className="ph ph-trend-down text-5xl opacity-20"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Stok Mengendap</p>
                            <p className="text-3xl font-bold mt-1">{filtered.reduce((sum, p) => sum + p.stock, 0)}</p>
                        </div>
                        <i className="ph ph-package text-5xl opacity-20"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-100 text-sm font-medium">Nilai Tersimpan</p>
                            <p className="text-3xl font-bold mt-1">
                                {(filtered.reduce((sum, p) => sum + p.stock * p.sellPrice, 0) / 1000000).toFixed(1)}M
                            </p>
                        </div>
                        <i className="ph ph-currency-circle-dollar text-5xl opacity-20"></i>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Daftar Produk Slow Moving</h2>
                </div>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">SKU</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                                Nama Produk
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Kategori</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">Stok</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">
                                Terjual ({period} Hari)
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">
                                Nilai Stok
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filtered.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-sm font-semibold text-slate-700">{product.sku}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{product.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">{product.category?.name || '-'}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700">
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-700">
                                        <i className="ph ph-trend-down mr-1"></i>
                                        {product.totalSold || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-semibold text-slate-800">
                                        Rp {(product.stock * product.sellPrice).toLocaleString('id-ID')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertComponent />
        </div>
    );
}
