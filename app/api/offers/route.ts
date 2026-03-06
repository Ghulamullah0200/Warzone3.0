import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Offer, OfferCard, IOffer } from '../../../lib/models';

// GET /api/offers — active offers with live card count, grouped by country
export async function GET() {
    try {
        await connectDB();
        const dbOffers = await Offer.find({ isActive: true }).sort({ country: 1, createdAt: -1 }).lean();

        const formatted = await Promise.all(
            dbOffers.map(async (o) => {
                const ot = o as unknown as IOffer;

                // For CARD types, count documents. For PROXY, use the stored count.
                const type = ot.type || 'CARD';
                const count = type === 'CARD'
                    ? await OfferCard.countDocuments({ offerId: ot._id.toString() })
                    : (ot.cardCount || 0);

                const avgPricePerCard = type === 'CARD' && count > 0
                    ? parseFloat((ot.price / count).toFixed(2))
                    : ot.avgPricePerCard || 0;

                return {
                    _id: ot._id.toString(),
                    id: ot._id.toString(),
                    title: ot.title,
                    description: ot.description,
                    country: ot.country || 'USA',
                    state: ot.state || '',
                    type,
                    cardCount: count,
                    proxyType: ot.proxyType || '',
                    proxyFile: ot.proxyFile || '',
                    discount: ot.discount,
                    originalPrice: ot.originalPrice,
                    price: ot.price,
                    avgPricePerCard,
                    badge: ot.badge || '',
                    isActive: ot.isActive,
                    styleIndex: ot.styleIndex ?? 0,
                    createdAt: ot.createdAt,
                };
            })
        );

        return NextResponse.json({ offers: formatted });
    } catch (err) {
        console.error('Offers API error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
