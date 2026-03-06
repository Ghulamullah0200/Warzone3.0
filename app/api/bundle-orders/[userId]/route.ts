import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { BundleOrder as BundleOrderModel } from '../../../../lib/models';
import type { BundleOrder } from '../../../../types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        await connectDB();

        const { userId } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const [bundleOrders, total] = await Promise.all([
            BundleOrderModel.find({ userId })
                .sort({ purchaseDate: -1 })
                .skip(skip)
                .limit(limit),
            BundleOrderModel.countDocuments({ userId })
        ]);

        const formatted = bundleOrders.map((bo: BundleOrder) => ({
            _id: bo._id.toString(),
            id: bo._id.toString(),
            userId: bo.userId,
            username: bo.username,
            bundleTitle: bo.bundleTitle,
            cardCount: bo.cardCount,
            discount: bo.discount,
            originalPrice: bo.originalPrice,
            price: bo.price,
            purchaseDate: bo.purchaseDate,
        }));

        return NextResponse.json({
            bundleOrders: formatted,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
            }
        });
    } catch (error: unknown) {
        console.error('Bundle orders fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
