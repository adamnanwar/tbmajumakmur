const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create new transaction (atomic: save transaction + update stock)
 * POST /api/transactions
 */
const createTransaction = async (req, res, next) => {
    try {
        const { items, paymentMethod } = req.body;
        const cashierId = req.user.id;

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Transaction items are required',
            });
        }

        // Calculate total and validate stock
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.productId} not found`,
                });
            }

            if (product.stock < item.qty) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`,
                });
            }

            const subtotal = product.sellPrice * item.qty;
            totalAmount += Number(subtotal);

            validatedItems.push({
                productId: item.productId,
                qty: item.qty,
                price: product.sellPrice,
                subtotal: subtotal,
            });
        }

        // Generate invoice number
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await prisma.transaction.count({
            where: {
                createdAt: {
                    gte: new Date(today.setHours(0, 0, 0, 0)),
                },
            },
        });
        const invoiceNo = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Create transaction
            const transaction = await tx.transaction.create({
                data: {
                    invoiceNo,
                    cashierId,
                    totalAmount,
                    paymentMethod: paymentMethod || 'CASH',
                    items: {
                        create: validatedItems,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    cashier: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // Update stock for each item
            for (const item of validatedItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.qty } },
                });

                // Create stock movement log
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: 'OUT',
                        qty: item.qty,
                        notes: `Penjualan - ${invoiceNo}`,
                        userId: cashierId,
                    },
                });
            }

            return transaction;
        });

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all transactions with filtering
 * GET /api/transactions
 */
const getAllTransactions = async (req, res, next) => {
    try {
        const { startDate, endDate, paymentMethod, page = 1, limit = 20 } = req.query;

        const where = {};

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        if (paymentMethod) {
            where.paymentMethod = paymentMethod;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    cashier: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: { items: true },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.transaction.count({ where }),
        ]);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get transaction by ID (for receipt printing)
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                sku: true,
                                name: true,
                                unit: true,
                            },
                        },
                    },
                },
                cashier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
            });
        }

        res.json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
};
