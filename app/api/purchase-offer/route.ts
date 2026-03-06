import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { User, Offer, OfferCard, OfferOrder, IOffer, IOfferOrderCard } from '../../../lib/models';
import { decryptCardData } from '../../../lib/encryption';

// POST /api/purchase-offer
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, offerId } = await req.json();

        if (!userId || !offerId) {
            return NextResponse.json({ error: 'userId and offerId are required' }, { status: 400 });
        }

        const [user, offer] = await Promise.all([
            User.findById(userId),
            Offer.findById(offerId) as Promise<IOffer | null>,
        ]);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        if (!offer.isActive) return NextResponse.json({ error: 'Offer is not active' }, { status: 400 });

        if (user.status !== 'APPROVED') {
            return NextResponse.json({ error: 'Account not approved' }, { status: 403 });
        }
        if (user.accountExpiresAt && new Date() > new Date(user.accountExpiresAt)) {
            return NextResponse.json({ error: 'Account expired. Please renew subscription.' }, { status: 403 });
        }
        if ((user.balance || 0) < offer.price) {
            return NextResponse.json({
                error: `Insufficient funds. Required: $${offer.price.toLocaleString()}, Available: $${(user.balance || 0).toLocaleString()}`
            }, { status: 400 });
        }

        let decryptedCards: IOfferOrderCard[] = [];
        if (offer.type === 'CARD') {
            // Fetch all OfferCards for this offer
            const rawCards = await OfferCard.find({ offerId: offerId.toString() }).lean();
            if (rawCards.length === 0) {
                return NextResponse.json({ error: 'No cards available in this offer' }, { status: 400 });
            }

            // Decrypt card data for the receipt
            decryptedCards = rawCards.map((c: Record<string, unknown>) => {
                const d = decryptCardData(c as Record<string, unknown>);
                return {
                    cardNumber: d.cardNumber || '',
                    cvv: d.cvv,
                    expiry: d.expiry,
                    holder: d.holder,
                    address: d.address,
                    bank: d.bank,
                    type: d.type,
                    zip: d.zip,
                    city: d.city,
                    state: d.state,
                    country: d.country,
                    ssn: d.ssn,
                    dob: d.dob,
                    email: d.email,
                    phone: d.phone,
                    userAgent: (c as Record<string, unknown>).userAgent as string | undefined,
                    password: d.password,
                    ip: d.ip,
                    videoLink: (c as Record<string, unknown>).videoLink as string | undefined,
                    proxy: d.proxy,
                };
            });
        }

        // Deduct balance
        user.balance = (user.balance || 0) - offer.price;
        await user.save();

        // Create OfferOrder receipt
        const offerOrder = await OfferOrder.create({
            userId: user._id.toString(),
            username: user.username,
            offerId: offer._id.toString(),
            offerTitle: offer.title,
            offerCountry: offer.country || 'USA',
            offerState: offer.state || '',
            offerType: offer.type || 'CARD',
            cardCount: offer.type === 'PROXY' ? (offer.cardCount || 0) : decryptedCards.length,
            proxyType: offer.proxyType || '',
            proxyFile: offer.proxyFile || '',
            discount: offer.discount,
            originalPrice: offer.originalPrice,
            price: offer.price,
            cards: decryptedCards,
        });

        return NextResponse.json({
            success: true,
            message: `Offer "${offer.title}" purchased! ${offer.type === 'PROXY' ? offer.cardCount : decryptedCards.length} ${offer.type === 'PROXY' ? 'proxies' : 'cards'} unlocked.`,
            offerId: offer._id.toString(),
            offerOrder: {
                _id: offerOrder._id.toString(),
                id: offerOrder._id.toString(),
                offerTitle: offerOrder.offerTitle,
                offerCountry: offerOrder.offerCountry,
                offerType: offerOrder.offerType,
                proxyType: offerOrder.proxyType,
                proxyFile: offerOrder.proxyFile,
                cardCount: offerOrder.cardCount,
                price: offerOrder.price,
                cards: decryptedCards,
                purchaseDate: offerOrder.purchaseDate,
                createdAt: offerOrder.createdAt,
            },
            newBalance: user.balance,
        });

    } catch (error) {
        console.error('Purchase offer error:', error);
        return NextResponse.json({ error: 'Server error: ' + (error as Error).message }, { status: 500 });
    }
}
