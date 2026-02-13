const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get sales report by period
 * GET /api/reports/sales
 */
const getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required',
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Get transactions in period
        const transactions = await prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                category: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Calculate summary
        const totalTransactions = transactions.length;
        const totalRevenue = transactions.reduce(
            (sum, t) => sum + Number(t.totalAmount),
            0
        );

        // Group by payment method
        const byPaymentMethod = transactions.reduce((acc, t) => {
            const method = t.paymentMethod;
            if (!acc[method]) {
                acc[method] = { count: 0, total: 0 };
            }
            acc[method].count++;
            acc[method].total += Number(t.totalAmount);
            return acc;
        }, {});

        // Top products
        const productSales = {};
        transactions.forEach((t) => {
            t.items.forEach((item) => {
                const productId = item.productId;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId,
                        productName: item.product.name,
                        category: item.product.category.name,
                        totalQty: 0,
                        totalRevenue: 0,
                    };
                }
                productSales[productId].totalQty += item.qty;
                productSales[productId].totalRevenue += Number(item.subtotal);
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10);

        res.json({
            success: true,
            data: {
                period: {
                    startDate,
                    endDate,
                },
                summary: {
                    totalTransactions,
                    totalRevenue,
                    averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
                },
                byPaymentMethod,
                topProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get inventory report (stock value)
 * GET /api/reports/inventory
 */
const getInventoryReport = async (req, res, next) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
            },
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Calculate values
        const report = products.map((p) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category.name,
            stock: p.stock,
            unit: p.unit,
            buyPrice: Number(p.buyPrice),
            sellPrice: Number(p.sellPrice),
            stockValue: p.stock * Number(p.buyPrice),
            potentialRevenue: p.stock * Number(p.sellPrice),
        }));

        const totalStockValue = report.reduce((sum, p) => sum + p.stockValue, 0);
        const totalPotentialRevenue = report.reduce((sum, p) => sum + p.potentialRevenue, 0);
        const totalItems = products.length;
        const totalUnits = report.reduce((sum, p) => sum + p.stock, 0);

        res.json({
            success: true,
            data: {
                summary: {
                    totalItems,
                    totalUnits,
                    totalStockValue,
                    totalPotentialRevenue,
                    estimatedProfit: totalPotentialRevenue - totalStockValue,
                },
                items: report,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSalesReport,
    getInventoryReport,
};
