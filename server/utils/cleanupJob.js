const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

const prisma = new PrismaClient();

/**
 * Auto-cleanup job: Permanently delete records that have been soft deleted for 30+ days
 * Runs daily at 2:00 AM
 */
const startCleanupJob = () => {
    // Run daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('🧹 Running soft delete cleanup job...');

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.setDate() - 30);

            // Delete products soft deleted 30+ days ago
            const deletedProducts = await prisma.product.deleteMany({
                where: {
                    deletedAt: {
                        lte: thirtyDaysAgo,
                    },
                },
            });

            // Delete categories soft deleted 30+ days ago
            const deletedCategories = await prisma.category.deleteMany({
                where: {
                    deletedAt: {
                        lte: thirtyDaysAgo,
                    },
                },
            });

            //Delete users soft deleted 30+ days ago
            const deletedUsers = await prisma.user.deleteMany({
                where: {
                    deletedAt: {
                        lte: thirtyDaysAgo,
                    },
                },
            });

            console.log(`✅ Cleanup complete: ${deletedProducts.count} products, ${deletedCategories.count} categories, ${deletedUsers.count} users permanently deleted`);
        } catch (error) {
            console.error('❌ Cleanup job error:', error);
        }
    });

    console.log('⏰ Soft delete cleanup job scheduled (daily at 2:00 AM)');
};

module.exports = { startCleanupJob };
