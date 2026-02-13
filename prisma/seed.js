const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Hapus data lama (opsional - hati-hati di production!)
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleaned database');

    // 1. Buat User Admin & Kasir
    const adminPassword = await bcrypt.hash('admin123', 10);
    const kasirPassword = await bcrypt.hash('kasir123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@majujaya.com',
            password: adminPassword,
            name: 'Administrator',
            role: 'ADMIN',
        },
    });

    const kasir = await prisma.user.create({
        data: {
            email: 'kasir@majujaya.com',
            password: kasirPassword,
            name: 'Kasir 1',
            role: 'CASHIER',
        },
    });

    console.log('✅ Created users:', { admin: admin.email, kasir: kasir.email });

    // 2. Buat Kategori
    const categories = await Promise.all([
        prisma.category.create({ data: { name: 'Semen', description: 'Berbagai jenis semen' } }),
        prisma.category.create({ data: { name: 'Cat', description: 'Cat tembok dan kayu' } }),
        prisma.category.create({ data: { name: 'Paku & Baut', description: 'Paku, baut, sekrup' } }),
        prisma.category.create({ data: { name: 'Keramik', description: 'Keramik lantai dan dinding' } }),
        prisma.category.create({ data: { name: 'Alat Tukang', description: 'Palu, gergaji, dll' } }),
    ]);

    console.log('✅ Created categories:', categories.length);

    // 3. Buat Produk
    const products = await Promise.all([
        // Semen
        prisma.product.create({
            data: {
                sku: 'SMN-001',
                name: 'Semen Gresik 50kg',
                categoryId: categories[0].id,
                buyPrice: 65000,
                sellPrice: 75000,
                stock: 150,
                unit: 'sak',
                minStock: 20,
            },
        }),
        prisma.product.create({
            data: {
                sku: 'SMN-002',
                name: 'Semen Tiga Roda 50kg',
                categoryId: categories[0].id,
                buyPrice: 63000,
                sellPrice: 73000,
                stock: 120,
                unit: 'sak',
                minStock: 20,
            },
        }),

        // Cat
        prisma.product.create({
            data: {
                sku: 'CAT-RED',
                name: 'Cat Avian Merah 1L',
                categoryId: categories[1].id,
                buyPrice: 45000,
                sellPrice: 55000,
                stock: 3,
                unit: 'klg',
                minStock: 5,
            },
        }),
        prisma.product.create({
            data: {
                sku: 'CAT-WHT',
                name: 'Cat Avian Putih 5L',
                categoryId: categories[1].id,
                buyPrice: 180000,
                sellPrice: 220000,
                stock: 25,
                unit: 'klg',
                minStock: 5,
            },
        }),
        prisma.product.create({
            data: {
                sku: 'CAT-PLK',
                name: 'Cat Pelapis Anti Bocor 4L',
                categoryId: categories[1].id,
                buyPrice: 100000,
                sellPrice: 120000,
                stock: 18,
                unit: 'klg',
                minStock: 5,
            },
        }),

        // Paku & Baut
        prisma.product.create({
            data: {
                sku: 'PKU-5CM',
                name: 'Paku 5cm',
                categoryId: categories[2].id,
                buyPrice: 12000,
                sellPrice: 15000,
                stock: 4,
                unit: 'kg',
                minStock: 10,
            },
        }),
        prisma.product.create({
            data: {
                sku: 'PKU-10CM',
                name: 'Paku 10cm',
                categoryId: categories[2].id,
                buyPrice: 13000,
                sellPrice: 16000,
                stock: 30,
                unit: 'kg',
                minStock: 10,
            },
        }),

        // Keramik
        prisma.product.create({
            data: {
                sku: 'KRM-40',
                name: 'Keramik Putih 40x40',
                categoryId: categories[3].id,
                buyPrice: 55000,
                sellPrice: 65000,
                stock: 80,
                unit: 'dus',
                minStock: 10,
            },
        }),
        prisma.product.create({
            data: {
                sku: 'KRM-60',
                name: 'Keramik Granit 60x60',
                categoryId: categories[3].id,
                buyPrice: 95000,
                sellPrice: 115000,
                stock: 45,
                unit: 'dus',
                minStock: 10,
            },
        }),

        // Alat Tukang
        prisma.product.create({
            data: {
                sku: 'PLU-01',
                name: 'Palu Godam',
                categoryId: categories[4].id,
                buyPrice: 70000,
                sellPrice: 85000,
                stock: 15,
                unit: 'pcs',
                minStock: 5,
            },
        }),
        prisma.product.create({
            data: {
                sku: 'GRG-01',
                name: 'Gergaji Besi',
                categoryId: categories[4].id,
                buyPrice: 28000,
                sellPrice: 35000,
                stock: 22,
                unit: 'pcs',
                minStock: 5,
            },
        }),
    ]);

    console.log('✅ Created products:', products.length);

    // 4. Buat Sample Transaksi
    const transaction = await prisma.transaction.create({
        data: {
            invoiceNo: 'INV-2025-001',
            cashierId: kasir.id,
            totalAmount: 223000,
            paymentMethod: 'CASH',
            items: {
                create: [
                    {
                        productId: products[0].id, // Semen Gresik
                        qty: 2,
                        price: 75000,
                        subtotal: 150000,
                    },
                    {
                        productId: products[2].id, // Cat Merah
                        qty: 1,
                        price: 55000,
                        subtotal: 55000,
                    },
                    {
                        productId: products[5].id, // Paku 5cm
                        qty: 1,
                        price: 15000,
                        subtotal: 15000,
                    },
                ],
            },
        },
    });

    console.log('✅ Created sample transaction:', transaction.invoiceNo);

    // 5. Update stok produk yang terjual
    await prisma.product.update({
        where: { id: products[0].id },
        data: { stock: { decrement: 2 } },
    });
    await prisma.product.update({
        where: { id: products[2].id },
        data: { stock: { decrement: 1 } },
    });
    await prisma.product.update({
        where: { id: products[5].id },
        data: { stock: { decrement: 1 } },
    });

    // 6. Buat Stock Movement Log
    await prisma.stockMovement.createMany({
        data: [
            {
                productId: products[0].id,
                type: 'OUT',
                qty: 2,
                notes: 'Penjualan via POS - ' + transaction.invoiceNo,
                userId: kasir.id,
            },
            {
                productId: products[2].id,
                type: 'OUT',
                qty: 1,
                notes: 'Penjualan via POS - ' + transaction.invoiceNo,
                userId: kasir.id,
            },
            {
                productId: products[5].id,
                type: 'OUT',
                qty: 1,
                notes: 'Penjualan via POS - ' + transaction.invoiceNo,
                userId: kasir.id,
            },
        ],
    });

    console.log('✅ Created stock movements');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@majujaya.com / admin123');
    console.log('   Kasir: kasir@majujaya.com / kasir123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
