const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Manual stock adjustment (IN/OUT/ADJUST)
 * POST /api/inventory/adjust
 */
const adjustStock = async (req, res, next) => {
    try {
        const { productId, type, qty, notes } = req.body;
        const userId = req.user.id;

        // Validation
        if (!productId || !type || !qty) {
            return res.status(400).json({
                success: false,
                message: 'productId, type, and qty are required',
            });
        }

        if (!['IN', 'OUT', 'ADJUST'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'type must be IN, OUT, or ADJUST',
            });
        }

        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Calculate new stock
        let newStock = product.stock;
        if (type === 'IN') {
            newStock += parseInt(qty);
        } else if (type === 'OUT') {
            newStock -= parseInt(qty);
            if (newStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for OUT operation',
                });
            }
        } else if (type === 'ADJUST') {
            newStock = parseInt(qty); // Direct set
        }

        // Use transaction for atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Update product stock
            const updatedProduct = await tx.product.update({
                where: { id: parseInt(productId) },
                data: { stock: newStock },
            });

            // Create stock movement log
            const movement = await tx.stockMovement.create({
                data: {
                    productId: parseInt(productId),
                    type,
                    qty: parseInt(qty),
                    notes: notes || null,
                    userId,
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            sku: true,
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            return { movement, updatedProduct };
        });

        res.status(201).json({
            success: true,
            message: 'Stock adjusted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get stock movement history
 * GET /api/inventory/history
 */
const getStockHistory = async (req, res, next) => {
    try {
        const { productId, type, startDate, endDate, page = 1, limit = 50 } = req.query;

        const where = {};

        if (productId) {
            where.productId = parseInt(productId);
        }

        if (type) {
            where.type = type;
        }

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

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [movements, total] = await Promise.all([
            prisma.stockMovement.findMany({
                where,
                include: {
                    product: {
                        select: {
                            id: true,
                            sku: true,
                            name: true,
                            unit: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.stockMovement.count({ where }),
        ]);

        res.json({
            success: true,
            data: movements,
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

module.exports = {
    adjustStock,
    getStockHistory,
};
