import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Offer, OfferCard, IOffer } from '../../../../lib/models';


// GET /api/admin/offers — list all offers with card count
export async function GET() {
    try {
        await connectDB();
        const offers = await Offer.find({}).sort({ createdAt: -1 });

        const formatted = await Promise.all(
            offers.map(async (o) => {
                const doc = o.toObject();
                const cardCount = await OfferCard.countDocuments({ offerId: doc._id.toString() });
                return {
                    _id: doc._id.toString(),
                    id: doc._id.toString(),
                    title: doc.title,
                    description: doc.description,
                    country: doc.country || 'USA',
                    state: doc.state || '',
                    type: doc.type || 'CARD',
                    cardCount: doc.type === 'PROXY' ? doc.cardCount : cardCount,
                    proxyType: doc.proxyType || '',
                    proxyFile: doc.proxyFile || '',
                    discount: doc.discount,
                    originalPrice: doc.originalPrice,
                    price: doc.price,
                    avgPricePerCard: doc.avgPricePerCard,
                    badge: doc.badge || '',
                    isActive: doc.isActive,
                    styleIndex: doc.styleIndex ?? 0,
                    createdAt: doc.createdAt,
                };
            })
        );
        return NextResponse.json({ offers: formatted });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// POST /api/admin/offers — create a new offer
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        console.log('[CREATE OFFER] Received body:', JSON.stringify(body));
        const { title, description, country, state, type, cardCount, proxyType, proxyFile, discount, originalPrice, price, badge, isActive, styleIndex } = body;

        console.log('[CREATE OFFER] type field from destructure:', type, '| typeof:', typeof type);

        if (!title || !country || discount == null || !originalPrice || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const finalType = type === 'PROXY' ? 'PROXY' : 'CARD';
        console.log('[CREATE OFFER] finalType being saved:', finalType);

        const offer = await Offer.create({
            title,
            description: description || '',
            country: country || 'USA',
            state: state || '',
            type: finalType,
            cardCount: finalType === 'PROXY' ? Number(cardCount || 0) : 0,
            proxyType: proxyType || '',
            proxyFile: proxyFile || '',
            discount: Number(discount),
            originalPrice: Number(originalPrice),
            price: Number(price),
            avgPricePerCard: 0,
            badge: badge || '',
            isActive: isActive !== false,
            styleIndex: Number(styleIndex ?? 0),
        });

        console.log('[CREATE OFFER] Saved offer type:', (offer as IOffer).type);
        return NextResponse.json({ success: true, offer });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
    }
}

