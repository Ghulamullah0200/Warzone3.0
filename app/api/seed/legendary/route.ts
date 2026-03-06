import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User, Payment, Order } from '../../../../lib/models';

export async function POST() {
    try {
        await connectDB();
        const email = 'legend@warzone.com';
        const username = 'LegendaryUser';

        // 1. Find existing user first to get ID for cleanup
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Cleanup data related to this user
            await Order.deleteMany({ userId: existingUser._id });
            await Payment.deleteMany({ userId: existingUser._id });
            await User.deleteOne({ _id: existingUser._id });
        }

        // Also ensure no username conflict if email was different
        await User.deleteOne({ username });

        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 7); // 7 days ago

        const expiresAt = new Date(pastDate);
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

        const trxId = 'LEGEND_' + Date.now();

        // Create User
        const user = await User.create({
            username,
            email,
            password: 'password123', // Storing plain text as per requested flow
            trxId,
            status: 'APPROVED',
            balance: 0,
            accountExpiresAt: expiresAt,
            createdAt: pastDate
        });

        const totalOrders = 1836;
        const days = 7;
        const ordersPerDay = Math.floor(totalOrders / days);
        const remainder = totalOrders % days;

        let currentPrice = 7000;
        const priceIncrement = 5;

        const depositsToCreate = [];
        const ordersToCreate = [];

        const cardTypes = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'];
        const banks = ['CHASE', 'BOA', 'WELLS FARGO', 'CITI'];

        for (let day = 0; day < days; day++) {
            const count = ordersPerDay + (day < remainder ? 1 : 0);
            let dailyTotal = 0;

            // Date for this batch (starting from 7 days ago)
            const dateBase = new Date(now);
            dateBase.setDate(dateBase.getDate() - (days - 1 - day)); // Day 0 is 7 days ago
            dateBase.setHours(12, 0, 0, 0);

            // Generate orders for this day
            for (let i = 0; i < count; i++) {
                const orderPrice = currentPrice;
                currentPrice += priceIncrement;
                dailyTotal += orderPrice;

                // Spread orders slightly throughout the day
                const orderDate = new Date(dateBase);
                orderDate.setMinutes(orderDate.getMinutes() + i * 2);

                ordersToCreate.push({
                    userId: user._id,
                    cardId: `mock_card_${day}_${i}`,
                    cardTitle: `${cardTypes[Math.floor(Math.random() * cardTypes.length)]} - ${banks[Math.floor(Math.random() * banks.length)]} PLATINUM - $${orderPrice}`,
                    cardNumber: '4' + Math.floor(100000000000000 + Math.random() * 900000000000000), // Random 16-digit
                    cvv: Math.floor(100 + Math.random() * 900).toString(),
                    expiry: '11/27',
                    price: orderPrice,
                    purchaseDate: orderDate
                });
            }

            // Create Deposit for this day
            const depositDate = new Date(dateBase);
            depositDate.setMinutes(depositDate.getMinutes() - 30);

            depositsToCreate.push({
                trxId: `DEP_${day}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                amount: dailyTotal,
                type: 'DEPOSIT',
                userId: user._id,
                status: 'APPROVED',
                createdAt: depositDate
            });
        }

        // Insert Data
        await Payment.insertMany(depositsToCreate);

        // Batch insert orders
        const chunkSize = 500;
        for (let i = 0; i < ordersToCreate.length; i += chunkSize) {
            await Order.insertMany(ordersToCreate.slice(i, i + chunkSize));
        }

        return NextResponse.json({
            success: true,
            message: 'Legendary user seeded with 1836 orders over 7 days.',
            user: {
                username: user.username,
                email: user.email,
                orders: totalOrders,
                finalBalance: 0
            }
        });

    } catch (error: unknown) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Server error: ' + (error as Error).message }, { status: 500 });
    }
}
