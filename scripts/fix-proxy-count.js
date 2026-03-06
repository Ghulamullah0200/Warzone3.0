require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const ProxySchema = new mongoose.Schema({
    price: Number, forSale: Boolean, type: String,
    country: String, title: String,
    createdAt: { type: Date, default: Date.now }
});

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Proxy = mongoose.models.Proxy || mongoose.model('Proxy', ProxySchema);

    const total = await Proxy.countDocuments({ forSale: true, country: 'US' });
    console.log('Current total US proxies:', total);

    if (total <= 1000) {
        console.log('Already at or below 1000 — nothing to delete.');
        await mongoose.disconnect();
        return;
    }

    // Delete oldest extras so only latest 1000 remain
    const toKeep    = 1000;
    const deleteCount = total - toKeep;
    const toDelete  = await Proxy.find({ forSale: true, country: 'US' })
        .sort({ createdAt: 1 })
        .limit(deleteCount)
        .select('_id')
        .lean();

    const ids = toDelete.map(p => p._id);
    const result = await Proxy.deleteMany({ _id: { $in: ids } });
    console.log('Deleted extra proxies:', result.deletedCount);

    const remaining = await Proxy.countDocuments({ forSale: true, country: 'US' });
    console.log('Remaining proxies:', remaining);

    const minP = await Proxy.find({ forSale: true, country: 'US' }).sort({ price:  1 }).limit(1).lean();
    const maxP = await Proxy.find({ forSale: true, country: 'US' }).sort({ price: -1 }).limit(1).lean();
    console.log('Min price: $' + (minP[0] && minP[0].price));
    console.log('Max price: $' + (maxP[0] && maxP[0].price));

    await mongoose.disconnect();
    process.exit(0);
}

fix().catch(err => { console.error(err.message); process.exit(1); });
