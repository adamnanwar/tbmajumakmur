import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatRupiah } from '../lib/utils';
import { productsAPI, transactionsAPI } from '../lib/api';

export default function POS() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const queryClient = useQueryClient();

    // Fetch products from database
    const { data: productsData } = useQuery({
        queryKey: ['products-pos', searchTerm],
        queryFn: async () => {
            const response = await productsAPI.getAll({ search: searchTerm });
            return response.data;
        },
    });

    const products = productsData?.data || [];

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        // Check if stock is 0
        if (product.stock === 0) {
            alert('Stok habis! Produk tidak dapat ditambahkan.');
            return;
        }

        const existing = cart.find((item) => item.id === product.id);
        const currentQtyInCart = existing ? existing.qty : 0;

        // Check if adding would exceed stock
        if (currentQtyInCart + 1 > product.stock) {
            alert(`Stok tidak cukup! Tersedia: ${product.stock} ${product.unit}`);
            return;
        }

        if (existing) {
            setCart(cart.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item)));
        } else {
            setCart([...cart, { ...product, price: product.sellPrice, qty: 1 }]);
        }
    };

    const updateQty = (id, delta) => {
        setCart((prev) => {
            const updated = prev.map((item) => {
                if (item.id === id) {
                    const newQty = item.qty + delta;

                    // Check stock limit when increasing
                    if (delta > 0 && newQty > item.stock) {
                        alert(`Stok tidak cukup! Maksimal: ${item.stock} ${item.unit}`);
                        return item;
                    }

                    return newQty > 0 ? { ...item, qty: newQty } : null;
                }
                return item;
            }).filter(Boolean);
            return updated;
        });
    };

    const clearCart = () => {
        if (cart.length > 0) {
            setCart([]);
        }
    };

    // Create transaction mutation
    const createTransactionMutation = useMutation({
        mutationFn: (data) => transactionsAPI.create(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['products-pos']);
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['slowMoving']);
            queryClient.invalidateQueries(['lowStock']);

            // Print receipt with real invoice data
            printReceipt(response.data.data);

            // Clear cart and close modal
            setCart([]);
            setShowPaymentModal(false);
            setPaymentMethod('CASH');
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Transaksi gagal!');
            setShowPaymentModal(false);
        },
    });

    const openPaymentModal = () => {
        if (cart.length === 0) {
            alert('Keranjang kosong!');
            return;
        }
        setShowPaymentModal(true);
    };

    const processPayment = () => {
        // Prepare transaction data
        const transactionData = {
            items: cart.map(item => ({
                productId: item.id,
                qty: item.qty,
            })),
            paymentMethod: paymentMethod,
        };

        createTransactionMutation.mutate(transactionData);
    };

    const printReceipt = (transaction) => {
        const invoiceNo = transaction?.invoiceNo || `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
        const printDate = new Date().toLocaleString('id-ID');

        const receiptContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Struk - ${invoiceNo}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .store-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .invoice-info {
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .items {
            margin: 10px 0;
        }
        .item {
            margin-bottom: 8px;
        }
        .item-name {
            font-weight: bold;
        }
        .item-detail {
            display: flex;
            justify-content: space-between;
            margin-top: 2px;
        }
        .totals {
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .grand-total {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
        }
        .payment-info {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 11px;
        }
        @media print {
            body { width: 80mm; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="store-name">TB. Makmur Lestari</div>
        <div>Toko Bangunan</div>
        <div style="font-size: 10px; margin-top: 5px;">
            Jl. Contoh No. 123, Kota<br>
            Telp: (021) 12345678
        </div>
    </div>

    <div class="invoice-info">
        <div><strong>No. Invoice:</strong> ${invoiceNo}</div>
        <div><strong>Tanggal:</strong> ${printDate}</div>
        <div><strong>Kasir:</strong> Administrator</div>
    </div>

    <div class="items">
        ${cart.map(item => `
            <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-detail">
                    <span>${formatRupiah(item.price)} x ${item.qty} ${item.unit}</span>
                    <span>${formatRupiah(item.price * item.qty)}</span>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatRupiah(total)}</span>
        </div>
        <div class="grand-total total-row">
            <span>TOTAL:</span>
            <span>${formatRupiah(total)}</span>
        </div>
    </div>

    <div class="payment-info">
        <div class="total-row">
            <span>Metode Bayar:</span>
            <span>${paymentMethod === 'CASH' ? 'Tunai' : 'Transfer/QRIS'}</span>
        </div>
    </div>

    <div class="footer">
        <div style="margin-bottom: 10px;">Terima kasih atas kunjungan Anda!</div>
        <div style="font-size: 10px;">Barang yang sudah dibeli tidak dapat dikembalikan</div>
    </div>

    <script>
        window.onload = function() {
            window.print();
            setTimeout(function() {
                window.close();
            }, 100);
        }
    </script>
</body>
</html>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(receiptContent);
        printWindow.document.close();
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const getStockStatus = (product) => {
        if (product.stock === 0) return { label: 'Habis', color: 'bg-red-100 text-red-700 border-red-300' };
        if (product.stock < product.minStock) return { label: 'Menipis', color: 'bg-amber-100 text-amber-700 border-amber-300' };
        return { label: 'Tersedia', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b">
                <h2 className="font-bold text-xl text-slate-800">Point of Sales</h2>
                <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-medium">
                    {currentDate}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden p-4 flex flex-col md:flex-row gap-4">
                {/* Product Grid */}
                <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <div className="relative">
                            <i className="ph ph-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-lg"></i>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari barang (Nama/SKU)..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => {
                                const stockStatus = getStockStatus(product);
                                const isOutOfStock = product.stock === 0;

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => !isOutOfStock && addToCart(product)}
                                        className={`bg-white border border-slate-200 rounded-lg p-3 transition-all flex flex-col h-full justify-between ${isOutOfStock
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'cursor-pointer hover:border-blue-500 hover:shadow-md group'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="text-sm font-bold text-slate-700 group-hover:text-blue-600 line-clamp-2 flex-1">
                                                    {product.name}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono mb-2 bg-slate-100 inline-block px-1 rounded">
                                                {product.sku}
                                            </div>
                                            <div className="mb-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockStatus.color}`}>
                                                    {stockStatus.label} • {product.stock} {product.unit}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="font-bold text-sm text-slate-900">
                                                {formatRupiah(product.price)}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">
                                                {product.unit}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Cart Section */}
                <div className="w-full md:w-[380px] flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <i className="ph ph-shopping-cart text-lg"></i> Keranjang
                        </h3>
                        <button
                            onClick={clearCart}
                            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                        >
                            Kosongkan
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <i className="ph ph-basket text-5xl mb-3 opacity-20"></i>
                                <p className="text-sm">Belum ada barang dipilih</p>
                            </div>
                        ) : (
                            cart.map((item) => {
                                const subtotal = item.price * item.qty;
                                return (
                                    <div
                                        key={item.id}
                                        className="flex justify-between p-3 border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-1 pr-2">
                                            <div className="font-semibold text-slate-700 line-clamp-1">{item.name}</div>
                                            <div className="text-slate-500 text-xs mt-1">
                                                {formatRupiah(item.price)} x {item.qty}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className="font-bold text-slate-800">{formatRupiah(subtotal)}</div>
                                            <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => updateQty(item.id, -1)}
                                                    className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 text-xs min-w-[1.5rem] text-center font-medium bg-slate-50 py-0.5 border-x border-slate-100">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.id, 1)}
                                                    className="px-2 py-0.5 hover:bg-slate-100 text-blue-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-lg space-y-4">
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatRupiah(total)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-slate-900 border-t border-slate-200 pt-3">
                            <span>Total</span>
                            <span>{formatRupiah(total)}</span>
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                                Metode Pembayaran
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all border-2 ${paymentMethod === 'CASH'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    <i className="ph ph-money mr-1"></i>
                                    Tunai
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('TRANSFER')}
                                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all border-2 ${paymentMethod === 'TRANSFER'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    <i className="ph ph-qr-code mr-1"></i>
                                    Transfer/QRIS
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={openPaymentModal}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <i className="ph ph-printer text-lg"></i> Bayar & Cetak
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Payment Confirmation Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="ph ph-receipt text-4xl text-blue-600"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Konfirmasi Pembayaran</h2>
                            <p className="text-slate-600">Pastikan detail transaksi sudah benar</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Jumlah Item:</span>
                                <span className="font-semibold text-slate-800">{cart.length} item</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Metode Pembayaran:</span>
                                <span className="font-semibold text-slate-800">
                                    {paymentMethod === 'CASH' ? 'Tunai' : 'Transfer/QRIS'}
                                </span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-slate-200">
                                <span className="font-bold text-slate-800">Total Bayar:</span>
                                <span className="font-bold text-xl text-blue-600">{formatRupiah(total)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={processPayment}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <i className="ph ph-check-circle text-xl"></i>
                                Proses & Cetak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
