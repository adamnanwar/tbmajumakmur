export default function Settings() {
    return (
        <div className="p-6 space-y-6">
            <h2 className="font-bold text-2xl text-slate-800">Pengaturan Toko</h2>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Toko</label>
                    <input
                        type="text"
                        defaultValue="TB. Makmur Lestari"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Alamat</label>
                    <textarea
                        rows={3}
                        defaultValue="Jl. Raya Utama No. 123, Kota"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Telepon</label>
                        <input
                            type="tel"
                            defaultValue="(021) 1234567"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            defaultValue="info@majujaya.com"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}
