import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert } from '../components/common/CustomDialogs';
import { inventoryAPI, productsAPI } from '../lib/api';

export default function StockMovement() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        productId: '',
        type: 'IN',
        qty: '',
        notes: '',
    });

    const { showAlert, AlertComponent } = useAlert();
    const queryClient = useQueryClient();

    // Fetch stock movement history
    const { data: movementsData, isLoading } = useQuery({
        queryKey: ['stockMovements', searchTerm],
        queryFn: async () => {
            const response = await inventoryAPI.getHistory({ productId: searchTerm ? undefined : undefined });
            return response.data;
        },
    });

    // Fetch products for dropdown
    const { data: productsData } = useQuery({
        queryKey: ['products-list'],
        queryFn: async () => {
            const response = await productsAPI.getAll();
            return response.data;
        },
    });

    // Adjust stock mutation
    const adjustMutation = useMutation({
        mutationFn: (data) => inventoryAPI.adjust(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['stockMovements']);
            queryClient.invalidateQueries(['products']);
            showAlert('Stock movement berhasil dicatat!', 'success');
            setShowModal(false);
            setFormData({ productId: '', type: 'IN', qty: '', notes: '' });
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal mencatat stock movement', 'error');
        },
    });

    const movements = movementsData?.data || [];
    const products = productsData?.data || [];

    const filtered = movements.filter((m) =>
        m.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeBadge = (type) => {
        const styles = {
            IN: 'bg-emerald-100 text-emerald-700 border-emerald-300',
            OUT: 'bg-rose-100 text-rose-700 border-rose-300',
            ADJUST: 'bg-blue-100 text-blue-700 border-blue-300',
        };
        const icons = {
            IN: 'ph-arrow-down-left',
            OUT: 'ph-arrow-up-right',
            ADJUST: 'ph-arrows-counter-clockwise',
        };
        return { style: styles[type], icon: icons[type] };
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.productId || !formData.qty) {
            showAlert('Mohon lengkapi semua field!', 'warning');
            return;
        }

        adjustMutation.mutate({
            productId: parseInt(formData.productId),
            type: formData.type,
            qty: parseInt(formData.qty),
            notes: formData.notes || '',
        });
    };

    const handleExport = () => {
        const csvContent = [
            ['Tanggal', 'Produk', 'Tipe', 'Jumlah', 'Keterangan', 'User'],
            ...filtered.map((m) => [
                new Date(m.createdAt).toLocaleString('id-ID'),
                m.product?.name || '-',
                m.type,
                m.qty,
                m.notes || '-',
                m.user?.name || '-',
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `stock_movement_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        showAlert('Riwayat mutasi stok berhasil diekspor!', 'success');
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
                    <h1 className="text-3xl font-bold text-slate-800">Mutasi Stok</h1>
                    <p className="text-slate-600 mt-1">Riwayat keluar masuk barang</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg"
                    >
                        <i className="ph ph-download text-xl"></i>
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg"
                    >
                        <i className="ph ph-arrows-counter-clockwise text-xl"></i>
                        Adjustment Manual
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Stok Masuk (IN)</p>
                            <p className="text-3xl font-bold mt-1">
                                {movements.filter((m) => m.type === 'IN').length}
                            </p>
                        </div>
                        <i className="ph ph-arrow-down-left text-5xl opacity-20"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-rose-100 text-sm font-medium">Stok Keluar (OUT)</p>
                            <p className="text-3xl font-bold mt-1">
                                {movements.filter((m) => m.type === 'OUT').length}
                            </p>
                        </div>
                        <i className="ph ph-arrow-up-right text-5xl opacity-20"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Adjustment</p>
                            <p className="text-3xl font-bold mt-1">
                                {movements.filter((m) => m.type === 'ADJUST').length}
                            </p>
                        </div>
                        <i className="ph ph-arrows-counter-clockwise text-5xl opacity-20"></i>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <i className="ph ph-magnifying-glass absolute left-3 top-3 text-slate-400 text-lg"></i>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari produk..."
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                    />
                </div>
            </div>

            {/* Movements Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Riwayat Mutasi Terbaru</h2>
                </div>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Tanggal</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Produk</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">Tipe</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">
                                Jumlah
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                                Keterangan
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">User</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filtered.map((movement) => {
                            const badge = getTypeBadge(movement.type);
                            return (
                                <tr key={movement.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600">
                                            {new Date(movement.createdAt).toLocaleString('id-ID')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{movement.product?.name || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.style}`}
                                        >
                                            <i className={`ph ${badge.icon} mr-1`}></i>
                                            {movement.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-slate-800">{movement.qty}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">{movement.notes || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-700">{movement.user?.name || '-'}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Adjustment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Adjustment Stok Manual</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Produk</label>
                                    <select
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Pilih Produk</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Stok: {p.stock})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipe</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="IN">IN - Stok Masuk</option>
                                        <option value="OUT">OUT - Stok Keluar</option>
                                        <option value="ADJUST">ADJUST - Koreksi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah</label>
                                    <input
                                        type="number"
                                        value={formData.qty}
                                        onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Keterangan</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Alasan adjustment..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjustMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {adjustMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AlertComponent />
        </div>
    );
}
