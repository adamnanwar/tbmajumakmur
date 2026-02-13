const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            where: { deletedAt: null }, // Filter soft deleted
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                products: {
                    where: { isActive: true },
                },
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new category
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        const category = await prisma.category.create({
            data: {
                name,
                description: description || null,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Soft delete category
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if category has active products
        const productsCount = await prisma.product.count({
            where: {
                categoryId: parseInt(id),
                deletedAt: null // Only count non-deleted products
            },
        });

        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It has ${productsCount} active product(s) associated.`,
            });
        }

        // Soft delete: set deletedAt timestamp
        await prisma.category.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() },
        });

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
