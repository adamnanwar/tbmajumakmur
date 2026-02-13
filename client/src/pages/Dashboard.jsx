export default function Dashboard() {
    const stats = [
        { label: 'Total Barang', value: '1,726', icon: 'ph-package', color: 'cyan' },
        { label: 'Pelanggan', value: '24', icon: 'ph-users', color: 'orange' },
        { label: 'Omset Bulan Ini', value: 'Rp 12.5jt', icon: 'ph-chart-bar', color: 'emerald' },
        { label: 'Laba Bulan Ini', value: 'Rp 4.2jt', icon: 'ph-chart-pie-slice', color: 'rose' },
    ];

    const lowStockItems = [
        { name: 'Cat Merah 1L', stock: 2 },
        { name: 'Paku 5cm', stock: '5 kg' },
    ];

    // Dummy chart data
    const chartData = [40, 60, 30, 80, 90, 50, 70];
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                    <p className="text-slate-500">Ringkasan performa toko hari ini.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center">
                        <i className="ph ph-calendar-blank mr-2"></i>
                        14 Des 2024
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center">
                        <i className="ph ph-download-simple mr-2"></i>
                        Export Laporan
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => {
                    const colorClasses = {
                        cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
                        orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
                        emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
                        rose: 'bg-gradient-to-br from-rose-500 to-rose-600',
                    }[stat.color];

                    return (
                        <div
                            key={idx}
                            className={`relative overflow-hidden rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group ${colorClasses}`}
                        >
                            <div className="relative z-10 text-white">
                                <div className="flex items-center gap-3 mb-3 opacity-90">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <i className={`ph ${stat.icon} text-xl`}></i>
                                    </div>
                                    <span className="text-sm font-medium tracking-wide">{stat.label}</span>
                                </div>
                                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-white/80 bg-white/10 w-fit px-2 py-1 rounded-full">
                                    <i className="ph ph-trend-up"></i>
                                    <span>+12.5% dari bulan lalu</span>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <i className={`ph ${stat.icon} absolute -right-6 -bottom-6 text-9xl opacity-10 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white`}></i>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Grafik */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Grafik Penjualan</h3>
                            <p className="text-sm text-slate-500">Statistik transaksi 7 hari terakhir</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option>7 Hari Terakhir</option>
                            <option>30 Hari Terakhir</option>
                        </select>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-4 px-2">
                        {chartData.map((height, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="relative w-full flex items-end justify-center h-full">
                                    <div
                                        className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out group-hover:opacity-90 relative ${idx === 4 ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-100 group-hover:bg-indigo-400'}`}
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg mb-2">
                                            {height} Transaksi
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium text-center ${idx === 4 ? 'text-indigo-600' : 'text-slate-400'}`}>{days[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stok Menipis */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="bg-white p-6 border-b border-slate-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
                                Stok Menipis
                            </h3>
                        </div>
                        <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-full font-bold">2 Item</span>
                    </div>

                    <div className="flex-1 p-4">
                        <div className="space-y-3">
                            {lowStockItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                                            <i className="ph ph-warning text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-700 group-hover:text-rose-700 transition-colors">{item.name}</div>
                                            <div className="text-xs text-slate-400">SKU: {idx === 0 ? 'CAT-RED' : 'PKU-5CM'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-rose-600">{item.stock}</div>
                                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Sisa</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 mt-auto">
                        <button className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center justify-center gap-2">
                            Lihat Inventaris Lengkap
                            <i className="ph ph-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
