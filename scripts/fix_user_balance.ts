import mongoose from 'mongoose';
import { User, Order, Card } from '../lib/models';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/warzone';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'legend@warzone.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found:', email);
            return;
        }

        console.log('User found:', user._id, 'Current balance:', user.balance);

        // Find the order to delete. 
        // User mentions "GOLD CARD" and the image shows ASSET_ID: 2BDE769C.
        // It might be stored in cardTitle or cardId.
        const orders = await Order.find({ userId: user._id.toString() });
        console.log('Orders found for user:', orders.length);

        let orderToDelete = null;
        for (const order of orders) {
            console.log(`Checking order: ${order._id}, Title: ${order.cardTitle}, CardNum: ${order.cardNumber}`);
            // The image shows number 2241 3114 5678...
            // Note: Card numbers in Order model might be encrypted. 
            // However, the search should likely be by title or some other metadata.
            if (order.cardTitle.includes('GOLD CARD')) {
                orderToDelete = order;
                break;
            }
        }

        if (orderToDelete) {
            await Order.deleteOne({ _id: orderToDelete._id });
            console.log('Deleted order:', orderToDelete._id);
        } else {
            console.log('No matching GOLD CARD order found.');
        }

        // Update balance to 17
        user.balance = 17;
        await user.save();
        console.log('Updated user balance to 17');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
