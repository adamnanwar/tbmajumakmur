export default function Header() {
    return (
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 border-b flex-shrink-0">
            <h2 className="font-bold text-xl text-slate-800">
                {/* Page title will be set by each page */}
            </h2>
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-slate-700">Administrator</div>
                    <div className="text-xs text-slate-500">Owner</div>
                </div>
                <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-300">
                    AD
                </div>
            </div>
        </header>
    );
}
