import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert, useConfirm } from '../components/common/CustomDialogs';
import { categoriesAPI } from '../lib/api';

export default function Categories() {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const { showAlert, AlertComponent } = useAlert();
    const { showConfirm, ConfirmComponent } = useConfirm();
    const queryClient = useQueryClient();

    // Fetch categories
    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await categoriesAPI.getAll();
            return response.data;
        },
    });

    // Create category mutation
    const createMutation = useMutation({
        mutationFn: (data) => categoriesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            showAlert('Kategori berhasil ditambahkan!', 'success');
            setShowModal(false);
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal menambahkan kategori', 'error');
        },
    });

    // Update category mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => categoriesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            showAlert('Kategori berhasil diupdate!', 'success');
            setShowModal(false);
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal mengupdate kategori', 'error');
        },
    });

    // Delete category mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => categoriesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            showAlert('Kategori berhasil dihapus!', 'success');
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal menghapus kategori', 'error');
        },
    });

    const categories = categoriesData?.data || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
        setFormData({ name: '', description: '' });
        setEditingCategory(null);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setShowModal(true);
    };

    const handleDelete = (category) => {
        showConfirm(`Yakin ingin menghapus kategori "${category.name}"?`, () => {
            deleteMutation.mutate(category.id);
        });
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
                    <h1 className="text-3xl font-bold text-slate-800">Kategori Produk</h1>
                    <p className="text-slate-600 mt-1">Kelola pengelompokan jenis material</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '' });
                        setShowModal(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg"
                >
                    <i className="ph ph-plus-circle text-xl"></i>
                    Tambah Kategori
                </button>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Nama Kategori
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Deskripsi
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Jumlah Produk
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-slate-800">{category.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600">{category.description || '-'}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                        {category._count?.products || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-sm font-medium"
                                    >
                                        <i className="ph ph-pencil"></i> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category)}
                                        className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition text-sm font-medium"
                                    >
                                        <i className="ph ph-trash"></i> Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Kategori
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCategory(null);
                                        setFormData({ name: '', description: '' });
                                    }}
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
