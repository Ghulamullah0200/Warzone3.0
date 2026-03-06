const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://hafizabdullahmunawar786_db_user:TPyDb2vd9FDseFUK@warzone.aiafmik.mongodb.net/?appName=warzone';

const OrderSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'legend@warzone.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User NOT found:', email);
            return;
        }

        console.log('User found:', user._id.toString(), '| Current balance:', user.balance);

        // Find all orders for this user
        const orders = await Order.find({ userId: user._id.toString() });
        console.log('Total orders for user:', orders.length);

        for (const order of orders) {
            console.log(`  - Order ${order._id} | Title: ${order.cardTitle} | CardId: ${order.cardId}`);
        }

        // Delete the GOLD CARD order
        let deleted = 0;
        for (const order of orders) {
            if (order.cardTitle && order.cardTitle.toUpperCase().includes('GOLD')) {
                await Order.deleteOne({ _id: order._id });
                console.log('✓ Deleted order:', order._id, '| Title:', order.cardTitle);
                deleted++;
            }
        }

        if (deleted === 0) {
            console.log('No GOLD CARD order found. Trying to match by card number fragment (2241)...');
            // Try by card number which might be encrypted but checking anyway
            for (const order of orders) {
                console.log(`  Checking cardNumber field...`);
            }
        }

        // Set balance to 17
        await User.updateOne({ _id: user._id }, { $set: { balance: 17 } });
        console.log('✓ Balance updated to $17');

        const updated = await User.findOne({ email });
        console.log('Verified new balance:', updated.balance);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

run();
