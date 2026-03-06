const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://hafizabdullahmunawar786_db_user:TPyDb2vd9FDseFUK@warzone.aiafmik.mongodb.net/?appName=warzone';
const OrderSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    await mongoose.connect(MONGODB_URI);
    const email = 'legend@warzone.com';
    const user = await User.findOne({ email });
    if (!user) { console.log('User not found'); return; }
    console.log('Balance:', user.balance);
    const orders = await Order.find({ userId: user._id.toString() });
    console.log('Remaining orders:', orders.length);
    for (const o of orders) {
        console.log(`  Title: "${o.cardTitle}" | ID: ${o._id}`);
    }
    await mongoose.disconnect();
}

run();
