import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (confirm('Keluar dari sistem?')) {
            // TODO: Clear auth
            navigate('/login');
        }
    };

    const menuItems = [
        {
            section: 'Menu Utama', items: [
                { path: '/dashboard', icon: 'ph-squares-four', label: 'Dashboard' },
                { path: '/categories', icon: 'ph-folder-open', label: 'Kategori' },
                { path: '/inventory', icon: 'ph-package', label: 'Produk' },
                { path: '/low-stock', icon: 'ph-warning', label: 'Stok Menipis' },
                { path: '/slow-moving', icon: 'ph-trend-down', label: 'Slow Moving' },
                { path: '/pos', icon: 'ph-shopping-cart', label: 'Transaksi (POS)' },
            ]
        },
        {
            section: 'Laporan', items: [
                { path: '/reports', icon: 'ph-receipt', label: 'Laporan' },
                { path: '/stock-movement', icon: 'ph-arrows-left-right', label: 'Mutasi Stok' },
            ]
        },
        {
            section: 'Admin', items: [
                { path: '/users', icon: 'ph-users', label: 'User Management' },
            ]
        },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl flex-shrink-0 z-20">
            <div className="p-6 flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center font-bold text-xl">
                    TB
                </div>
                <div>
                    <span className="font-bold text-lg text-white tracking-wide block leading-none">Makmur Lestari</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Store System</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-4">
                {menuItems.map((section, idx) => (
                    <div key={idx}>
                        <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                            {section.section}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:translate-x-1'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <i className={`ph ${item.icon} text-lg ${isActive ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
                                            {item.label}
                                            {isActive && <i className="ph ph-caret-right ml-auto text-xs opacity-50"></i>}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all w-full group border border-transparent hover:border-rose-500/20"
                >
                    <i className="ph ph-sign-out text-lg group-hover:-translate-x-0.5 transition-transform"></i>
                    Keluar Sistem
                </button>
            </div>
        </aside>
    );
}
