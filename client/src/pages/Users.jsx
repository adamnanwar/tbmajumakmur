import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert, useConfirm } from '../components/common/CustomDialogs';
import { usersAPI } from '../lib/api';

export default function Users() {
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CASHIER',
    });

    const { showAlert, AlertComponent } = useAlert();
    const { showConfirm, ConfirmComponent } = useConfirm();
    const queryClient = useQueryClient();

    // Fetch users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await usersAPI.getAll();
            return response.data;
        },
    });

    // Create user mutation
    const createMutation = useMutation({
        mutationFn: (data) => usersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            showAlert('User berhasil ditambahkan!', 'success');
            setShowModal(false);
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal menambahkan user', 'error');
        },
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => usersAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            showAlert('User berhasil diupdate!', 'success');
            setShowModal(false);
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal mengupdate user', 'error');
        },
    });

    // Delete user mutation (soft delete)
    const deleteMutation = useMutation({
        mutationFn: (id) => usersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            showAlert('User berhasil dihapus!', 'success');
        },
        onError: (error) => {
            showAlert(error.response?.data?.message || 'Gagal menghapus user', 'error');
        },
    });

    const users = usersData?.data || [];

    const handleAdd = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'CASHIER' });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
        setShowModal(true);
    };

    const handleDelete = (user) => {
        showConfirm(`Hapus user "${user.name}"?`, () => {
            deleteMutation.mutate(user.id);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = { ...formData };
        if (editingUser && !data.password) {
            delete data.password; // Don't update password if empty
        }

        if (editingUser) {
            updateMutation.mutate({ id: editingUser.id, data });
        } else {
            createMutation.mutate(data);
        }
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
                <h2 className="font-bold text-2xl text-slate-800">Manajemen Pengguna</h2>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center gap-2"
                >
                    <i className="ph ph-plus text-lg"></i> Tambah User
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3 text-center">Role</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-semibold text-slate-700">{user.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                                        >
                                            <i className="ph ph-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user)}
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            {editingUser ? 'Edit User' : 'Tambah User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Password {editingUser && '(Kosongkan jika tidak diubah)'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    required={!editingUser}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="CASHIER">Kasir</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
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
