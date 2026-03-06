import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { BundleOrder } from '../../../../lib/models';

export async function GET() {
    try {
        await connectDB();

        const bundleOrders = await BundleOrder.find({})
            .sort({ purchaseDate: -1 })
            .limit(200);

        const formatted = bundleOrders.map((bo: { _id: { toString: () => string }; userId: string; username: string; bundleTitle: string; cardCount: number; discount: number; originalPrice: number; price: number; purchaseDate: Date }) => ({
            _id: (bo._id as { toString: () => string }).toString(),
            id: (bo._id as { toString: () => string }).toString(),
            userId: bo.userId,
            username: bo.username,
            bundleTitle: bo.bundleTitle,
            cardCount: bo.cardCount,
            discount: bo.discount,
            originalPrice: bo.originalPrice,
            price: bo.price,
            purchaseDate: bo.purchaseDate,
        }));

        return NextResponse.json({ bundleOrders: formatted });
    } catch (error: unknown) {
        console.error('Admin bundle orders error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
