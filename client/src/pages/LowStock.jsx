import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAlert } from '../components/common/CustomDialogs';
import { productsAPI } from '../lib/api';

export default function LowStock() {
    const [searchTerm, setSearchTerm] = useState('');
    const { showAlert, AlertComponent } = useAlert();

    // Fetch low stock products from API
    const { data: lowStockData, isLoading } = useQuery({
        queryKey: ['lowStock'],
        queryFn: async () => {
            const response = await productsAPI.getLowStock();
            return response.data;
        },
    });

    const products = lowStockData?.data || [];

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockLevel = (stock, minStock) => {
        const percentage = (stock / minStock) * 100;
        if (percentage <= 50) return { label: 'Kritis', color: 'bg-rose-100 text-rose-700 border-rose-300' };
        if (percentage <= 80) return { label: 'Rendah', color: 'bg-amber-100 text-amber-700 border-amber-300' };
        return { label: 'Aman', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
    };

    const handleExport = () => {
        const csvContent = [
            ['SKU', 'Nama Produk', 'Kategori', 'Stok Saat Ini', 'Min. Stok', 'Satuan', 'Status'],
            ...filtered.map((p) => {
                const status = getStockLevel(p.stock, p.minStock);
                return [p.sku, p.name, p.category?.name || '-', p.stock, p.minStock, p.unit, status.label];
            }),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `low_stock_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        showAlert('Data stok menipis berhasil diekspor!', 'success');
    };

    const kritisCount = products.filter((p) => (p.stock / p.minStock) * 100 <= 50).length;
    const rendahCount = products.filter((p) => {
        const pct = (p.stock / p.minStock) * 100;
        return pct > 50 && pct <= 80;
    }).length;

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
                    <h1 className="text-3xl font-bold text-slate-800">Stok Menipis</h1>
                    <p className="text-slate-600 mt-1">Produk yang stoknya di bawah batas minimum</p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg"
                >
                    <i className="ph ph-download text-xl"></i>
                    Export CSV
                </button>
            </div>

            {/* Alert Summary */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-rose-100 text-sm font-medium">Kritis</p>
                            <p className="text-3xl font-bold mt-1">{kritisCount}</p>
                        </div>
                        <i className="ph ph-warning-circle text-5xl opacity-20"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Rendah</p>
                            <p className="text-3xl font-bold mt-1">{rendahCount}</p>
                        </div>
                        <i className="ph ph-warning text-5xl opacity-20"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Produk</p>
                            <p className="text-3xl font-bold mt-1">{filtered.length}</p>
                        </div>
                        <i className="ph ph-package text-5xl opacity-20"></i>
                    </div>
                </div>
            </div>

            {/* Search*/}
            <div className="mb-6">
                <div className="relative">
                    <i className="ph ph-magnifying-glass absolute left-3 top-3 text-slate-400 text-lg"></i>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari produk (Nama/SKU)..."
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Daftar Produk Stok Menipis</h2>
                </div>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">SKU</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                                Nama Produk
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Kategori</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">
                                Stok Saat Ini
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">
                                Min. Stok
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filtered.map((product) => {
                            const stockLevel = getStockLevel(product.stock, product.minStock);
                            return (
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
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-700">
                                            {product.stock} {product.unit}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-slate-600">
                                            {product.minStock} {product.unit}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${stockLevel.color}`}
                                        >
                                            <i className="ph ph-warning-circle mr-1"></i>
                                            {stockLevel.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200 mt-6">
                    <i className="ph ph-check-circle text-6xl text-emerald-500 mb-4"></i>
                    <p className="text-xl font-semibold text-slate-800">Semua Produk Aman</p>
                    <p className="text-slate-600 mt-2">Tidak ada produk dengan stok di bawah minimum</p>
                </div>
            )}

            <AlertComponent />
        </div>
    );
}
