import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatRupiah } from '../lib/utils';
import { useAlert, useConfirm } from '../components/common/CustomDialogs';
import { productsAPI, categoriesAPI } from '../lib/api';

export default function Inventory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        categoryId: '',
        stock: '',
        unit: 'pcs',
        buyPrice: '',
        sellPrice: '',
        minStock: '',
    });

    const { showAlert, AlertComponent } = useAlert();
    const { showConfirm, ConfirmComponent } = useConfirm();
    const queryClient = useQueryClient();

    // Fetch products
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', searchTerm],
        queryFn: async () => {
            const response = await productsAPI.getAll({ search: searchTerm });
            return response.data;
        },
    });

    // Fetch categories for dropdown
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await categoriesAPI.getAll();
            return response.data;
        },
    });

    // Create product mutation
    const createMutation = useMutation({
        mutationFn: (data) => productsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            showAlert('Produk berhasil ditambahkan!', 'success');
            setShowModal(false);
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal menambahkan produk', 'error');
        },
    });

    // Update product mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => productsAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            showAlert('Produk berhasil diupdate!', 'success');
            setShowModal(false);
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal mengupdate produk', 'error');
        },
    });

    // Delete product mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => productsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            showAlert('Produk berhasil dihapus!', 'success');
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal menghapus produk', 'error');
        },
    });

    const products = productsData?.data || [];
    const categories = categoriesData?.data || [];

    const handleAdd = () => {
        setEditingProduct(null);
        setFormData({
            sku: '',
            name: '',
            categoryId: '',
            stock: '',
            unit: 'pcs',
            buyPrice: '',
            sellPrice: '',
            minStock: '',
        });
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            sku: product.sku,
            name: product.name,
            categoryId: product.categoryId,
            stock: product.stock,
            unit: product.unit,
            buyPrice: product.buyPrice,
            sellPrice: product.sellPrice,
            minStock: product.minStock,
        });
        setShowModal(true);
    };

    const handleDelete = (product) => {
        showConfirm(`Hapus produk "${product.name}"?`, () => {
            deleteMutation.mutate(product.id);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            ...formData,
            categoryId: parseInt(formData.categoryId),
            stock: parseInt(formData.stock),
            buyPrice: parseFloat(formData.buyPrice),
            sellPrice: parseFloat(formData.sellPrice),
            minStock: parseInt(formData.minStock),
        };

        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleExport = () => {
        const csvContent = [
            ['SKU', 'Nama Produk', 'Kategori', 'Stok', 'Satuan', 'Harga Beli', 'Harga Jual', 'Min Stock'],
            ...products.map((p) => [
                p.sku,
                p.name,
                p.category?.name || '-',
                p.stock,
                p.unit,
                p.buyPrice,
                p.sellPrice,
                p.minStock,
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        showAlert('Data berhasil diekspor!', 'success');
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-96">
                <div className="text-center">
                    <i className="ph ph-spinner text-6xl text-blue-600 animate-spin"></i>
                    <p className="mt-4 text-slate-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl text-slate-800">Inventaris</h2>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                        <i className="ph ph-download text-lg"></i> Export CSV
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                        <i className="ph ph-plus text-lg"></i> Tambah Produk
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                    <div className="relative">
                        <i className="ph ph-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-lg"></i>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari produk (Nama/SKU)..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold">
                            <tr>
                                <th className="px-4 py-3">SKU</th>
                                <th className="px-4 py-3">Nama Produk</th>
                                <th className="px-4 py-3">Kategori</th>
                                <th className="px-4 py-3 text-right">Stok</th>
                                <th className="px-4 py-3 text-right">Harga Beli</th>
                                <th className="px-4 py-3 text-right">Harga Jual</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-xs bg-slate-100">{product.sku}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-700">{product.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{product.category?.name || '-'}</td>
                                    <td
                                        className={`px-4 py-3 text-right font-bold ${product.stock < product.minStock ? 'text-red-600' : 'text-slate-700'
                                            }`}
                                    >
                                        {product.stock} {product.unit}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {formatRupiah(product.buyPrice)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                        {formatRupiah(product.sellPrice)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                                        >
                                            <i className="ph ph-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Produk</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Stok</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Satuan</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pcs">pcs</option>
                                        <option value="kg">kg</option>
                                        <option value="sak">sak</option>
                                        <option value="klg">klg</option>
                                        <option value="dus">dus</option>
                                        <option value="meter">meter</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min. Stok</label>
                                    <input
                                        type="number"
                                        value={formData.minStock}
                                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Harga Beli</label>
                                    <input
                                        type="number"
                                        value={formData.buyPrice}
                                        onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Harga Jual</label>
                                    <input
                                        type="number"
                                        value={formData.sellPrice}
                                        onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="0"
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
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AlertComponent />
            <ConfirmComponent />
        </div>
    );
}
