import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../../lib/db';
import { Offer, OfferCard } from '../../../../../../lib/models';
import { encrypt, decrypt, decryptCardData } from '../../../../../../lib/encryption';

// GET /api/admin/offers/[id]/cards — list all cards for this offer
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const cards = await OfferCard.find({ offerId: id }).sort({ createdAt: -1 }).lean();
        const decrypted = cards.map(c => {
            const d = decryptCardData(c as Record<string, unknown>);
            return { ...d, _id: String((c as Record<string, unknown>)._id), offerId: id };
        });
        return NextResponse.json({ cards: decrypted });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

// POST /api/admin/offers/[id]/cards — add a card to this offer
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const offer = await Offer.findById(id);
        if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

        const body = await req.json();
        const { cardNumber, cvv, expiry, holder, address, bank, type, zip, city, state, country,
            ssn, dob, email, phone, userAgent, password, ip, videoLink, proxy } = body;

        if (!cardNumber) {
            return NextResponse.json({ error: 'Card number is required' }, { status: 400 });
        }

        // Check current card count — max 8
        const currentCount = await OfferCard.countDocuments({ offerId: id });
        if (currentCount >= 8) {
            return NextResponse.json({ error: 'Maximum 8 cards per offer reached' }, { status: 400 });
        }

        const card = await OfferCard.create({
            offerId: id,
            cardNumber: encrypt(cardNumber),
            cvv: cvv ? encrypt(cvv) : undefined,
            expiry, holder: holder ? encrypt(holder) : undefined,
            address: address ? encrypt(address) : undefined,
            bank: bank ? encrypt(bank) : undefined,
            type: type ? encrypt(type) : undefined,
            zip: zip ? encrypt(zip) : undefined,
            city: city ? encrypt(city) : undefined,
            state: state ? encrypt(state) : undefined,
            country: country ? encrypt(country) : undefined,
            ssn: ssn ? encrypt(ssn) : undefined,
            dob: dob ? encrypt(dob) : undefined,
            email: email ? encrypt(email) : undefined,
            phone: phone ? encrypt(phone) : undefined,
            userAgent, password: password ? encrypt(password) : undefined,
            ip: ip ? encrypt(ip) : undefined,
            videoLink, proxy: proxy ? encrypt(proxy) : undefined,
        });

        // Update offer cardCount
        const newCount = currentCount + 1;
        const avgPricePerCard = parseFloat((offer.price / newCount).toFixed(2));
        await Offer.findByIdAndUpdate(id, { cardCount: newCount, avgPricePerCard });

        return NextResponse.json({ success: true, card: { ...decryptCardData(card.toObject() as Record<string, unknown>), _id: card._id.toString() } });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

// DELETE /api/admin/offers/[id]/cards?cardId=xxx — remove a card
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const cardId = searchParams.get('cardId');

        if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 });

        await OfferCard.findByIdAndDelete(cardId);

        // Recalculate cardCount
        const newCount = await OfferCard.countDocuments({ offerId: id });
        const offer = await Offer.findById(id);
        const avgPricePerCard = offer && newCount > 0
            ? parseFloat((offer.price / newCount).toFixed(2))
            : 0;
        await Offer.findByIdAndUpdate(id, { cardCount: newCount, avgPricePerCard });

        // Suppress unused import warning
        void decrypt;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
