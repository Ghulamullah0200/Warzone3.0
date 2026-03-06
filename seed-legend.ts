
import 'dotenv/config';
import { connectDB } from './lib/db';
import { User, Payment, Order } from './lib/models';
import mongoose from 'mongoose';

async function seedLegend() {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected.');

        const email = 'legend@warzone.com';
        const username = 'LegendaryUser';

        console.log(`Cleaning up user ${email}...`);

        // Find existing user to get ID for cleanup
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Found existing user, deleting data...');
            await Order.deleteMany({ userId: existingUser._id });
            await Payment.deleteMany({ userId: existingUser._id });
            await User.deleteOne({ _id: existingUser._id });
        } else {
            console.log('User not found, proceeding to create new.');
        }

        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 7); // 7 days ago

        const expiresAt = new Date(pastDate);
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

        const trxId = 'LEGEND_' + Date.now();

        console.log('Creating User...');
        const user = await User.create({
            username,
            email,
            password: 'password123',
            trxId,
            status: 'APPROVED',
            balance: 0,
            accountExpiresAt: expiresAt,
            createdAt: pastDate
        });
        console.log('User created:', user._id);

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

        console.log('Generating orders and deposits...');

        for (let day = 0; day < days; day++) {
            // Count for this day
            // We want to distribute remainders across days, or just add to first few days.
            // Day 0 to remainder-1 get +1 order.
            const count = ordersPerDay + (day < remainder ? 1 : 0);

            let dailyTotal = 0;

            // Date logic: 
            // Day 0 is 7 days ago.
            // Day 6 is Today.
            const dateBase = new Date(now);
            dateBase.setDate(dateBase.getDate() - (days - 1 - day));
            dateBase.setHours(12, 0, 0, 0); // Noon

            // Generate orders for this day
            for (let i = 0; i < count; i++) {
                const orderPrice = currentPrice;
                currentPrice += priceIncrement;
                dailyTotal += orderPrice;

                // Spread orders slightly throughout the day
                const orderDate = new Date(dateBase);
                orderDate.setMinutes(orderDate.getMinutes() + i * 2); // 2 mins apart

                ordersToCreate.push({
                    userId: user._id,
                    cardId: `mock_card_${day}_${i}`,
                    cardTitle: `${cardTypes[Math.floor(Math.random() * cardTypes.length)]} - ${banks[Math.floor(Math.random() * banks.length)]} PLATINUM - $${orderPrice}`,
                    cardNumber: '**** **** **** ' + Math.floor(1000 + Math.random() * 9000),
                    price: orderPrice,
                    purchaseDate: orderDate
                });
            }

            // Create Deposit for this day covering the total cost
            // Deposit slightly before first order
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

        console.log(`Inserting ${depositsToCreate.length} deposits...`);
        await Payment.insertMany(depositsToCreate);

        console.log(`Inserting ${ordersToCreate.length} orders...`);
        // Batch insert orders
        const chunkSize = 500;
        for (let i = 0; i < ordersToCreate.length; i += chunkSize) {
            await Order.insertMany(ordersToCreate.slice(i, i + chunkSize));
            console.log(`Inserted chunk ${i} to ${Math.min(i + chunkSize, ordersToCreate.length)}`);
        }

        console.log('✅ Seed complete!');
        console.log(`Total Orders: ${totalOrders}`);
        console.log(`Final Price: ${currentPrice}`);
        console.log('User ID:', user._id);

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedLegend();
