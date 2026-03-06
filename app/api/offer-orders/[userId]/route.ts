import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { OfferOrder } from '../../../../lib/models';

// GET /api/offer-orders/[userId]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await connectDB();
        const { userId } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');

        const allOrders = await OfferOrder.find({ userId })
            .sort({ purchaseDate: -1 })
            .lean();

        const total = allOrders.length;
        const startIdx = (page - 1) * limit;
        const orders = allOrders.slice(startIdx, startIdx + limit).map(o => ({
            _id: String(o._id),
            id: String(o._id),
            userId: o.userId,
            username: o.username,
            offerId: o.offerId,
            offerTitle: o.offerTitle,
            offerCountry: o.offerCountry,
            cardCount: o.cardCount,
            discount: o.discount,
            originalPrice: o.originalPrice,
            price: o.price,
            cards: o.cards,
            purchaseDate: o.purchaseDate,
        }));

        return NextResponse.json({
            offerOrders: orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
            },
        });
    } catch (error) {
        console.error('Fetch offer orders error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
