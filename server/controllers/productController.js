const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all products with filtering and search
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
    try {
        const { search, categoryId, isActive } = req.query;

        const where = { deletedAt: null }; // Filter soft deleted

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { sku: { contains: search } },
            ];
        }

        if (categoryId) {
            where.categoryId = parseInt(categoryId);
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new product
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
    try {
        const { sku, name, categoryId, buyPrice, sellPrice, stock, unit, minStock } = req.body;

        // Validation
        if (!sku || !name || !categoryId || !buyPrice || !sellPrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sku, name, categoryId, buyPrice, sellPrice',
            });
        }

        const product = await prisma.product.create({
            data: {
                sku,
                name,
                categoryId: parseInt(categoryId),
                buyPrice: parseFloat(buyPrice),
                sellPrice: parseFloat(sellPrice),
                stock: stock ? parseInt(stock) : 0,
                unit: unit || 'pcs',
                minStock: minStock ? parseInt(minStock) : 5,
            },
            include: {
                category: true,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update product
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { sku, name, categoryId, buyPrice, sellPrice, stock, unit, minStock, isActive } = req.body;

        const updateData = {};

        if (sku) updateData.sku = sku;
        if (name) updateData.name = name;
        if (categoryId) updateData.categoryId = parseInt(categoryId);
        if (buyPrice) updateData.buyPrice = parseFloat(buyPrice);
        if (sellPrice) updateData.sellPrice = parseFloat(sellPrice);
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (unit) updateData.unit = unit;
        if (minStock !== undefined) updateData.minStock = parseInt(minStock);
        if (isActive !== undefined) updateData.isActive = isActive;

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                category: true,
            },
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Soft delete product (set deletedAt timestamp)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Soft delete: set deletedAt timestamp
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
                isActive: false
            },
        });

        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get products with low stock (stock < minStock)
 * GET /api/products/low-stock
 */
const getLowStock = async (req, res, next) => {
    try {
        const products = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.stock < p.minStock 
        AND p.isActive = true 
        AND p.deletedAt IS NULL
      ORDER BY p.stock ASC
    `;

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get slow-moving products (products with minimal sales in last 30 days)
 * GET /api/products/slow-moving
 */
const getSlowMoving = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const threshold = parseInt(req.query.threshold) || 5;

        // Get products that have sold less than threshold units in the last X days
        const slowMovingProducts = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.stock,
        p.sellPrice,
        c.name as categoryName,
        COALESCE(SUM(ti.qty), 0) as totalSold
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN transaction_items ti ON p.id = ti.productId
      LEFT JOIN transactions t ON ti.transactionId = t.id 
        AND t.createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      WHERE p.isActive = true AND p.deletedAt IS NULL
      GROUP BY p.id, p.sku, p.name, p.stock, p.sellPrice, c.name
      HAVING totalSold < ${threshold}
      ORDER BY totalSold ASC, p.stock DESC
    `;

        res.json({
            success: true,
            count: slowMovingProducts.length,
            days,
            threshold,
            data: slowMovingProducts,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStock,
    getSlowMoving,
};
