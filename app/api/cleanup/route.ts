import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { User, Card, Order, Payment, ActivityLog, BundleOrder } from '../../../lib/models';

export async function GET() {
    try {
        await connectDB();

        const LEGEND_EMAIL = 'legend@warzone.com';

        // Find the legendary user
        const legendaryUser = await User.findOne({ email: LEGEND_EMAIL });

        if (!legendaryUser) {
            return NextResponse.json({ error: 'Legendary user not found. Cleanup aborted for safety.' }, { status: 404 });
        }

        const legendaryUserId = legendaryUser._id.toString();

        // 1. Delete all users except legend
        const userDelete = await User.deleteMany({ email: { $ne: LEGEND_EMAIL } });

        // 2. Delete all orders except those by legend
        const orderDelete = await Order.deleteMany({ purchaserEmail: { $ne: LEGEND_EMAIL } });

        // 3. Get IDs of cards purchased by legend to keep them
        const legendaryOrders = await Order.find({ purchaserEmail: LEGEND_EMAIL });
        const keepCardIds = legendaryOrders.map(o => o.cardId);

        // 4. Delete all cards except those purchased by legend
        // Note: The user said "remove unsold cards... except those cards which legendaryuser purchased"
        // This implies keep ONLY cards purchased by legend.
        const cardDelete = await Card.deleteMany({
            _id: { $nin: keepCardIds }
        });

        // 5. Delete other related data
        const paymentDelete = await Payment.deleteMany({ userId: { $ne: legendaryUserId } });
        const activityDelete = await ActivityLog.deleteMany({ userId: { $ne: legendaryUserId } });
        const bundleDelete = await BundleOrder.deleteMany({ userId: { $ne: legendaryUserId } });

        // 6. Optional: Delete all offers if you want a fresh start
        // const offerDelete = await Offer.deleteMany({});

        return NextResponse.json({
            success: true,
            message: 'Cleanup completed successfully',
            deleted: {
                users: userDelete.deletedCount,
                orders: orderDelete.deletedCount,
                cards: cardDelete.deletedCount,
                payments: paymentDelete.deletedCount,
                activityLogs: activityDelete.deletedCount,
                bundleOrders: bundleDelete.deletedCount
            },
            preserved: {
                user: LEGEND_EMAIL,
                cardIds: keepCardIds.length
            }
        });
    } catch (error: unknown) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: 'Cleanup failed', details: (error as Error).message }, { status: 500 });
    }
}
