import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Card } from '../../../../lib/models';
import { encryptCardData, decryptCardData } from '../../../../lib/encryption';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const cardData = await req.json();

        // Encrypt sensitive data before saving
        const encryptedData = encryptCardData(cardData);

        // Create new card with encrypted fields
        const card = await Card.create(encryptedData);

        return NextResponse.json({
            success: true,
            message: 'Card added successfully',
            card: {
                id: card._id.toString(),
                title: card.title,
                price: card.price
            }
        });
    } catch (error) {
        console.error('Add card error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
export async function GET() {
    try {
        await connectDB();
        // Sort by forSale (true first), then createdAt (-1 for new first)
        const cards = await Card.find({}).sort({ forSale: -1, createdAt: -1 });

        const decryptedCards = cards.map(card => {
            const cardObj = card.toObject();
            const decrypted = decryptCardData(cardObj);
            return {
                ...decrypted,
                id: card._id.toString(),
                _id: card._id.toString()
            };
        });

        return NextResponse.json({
            success: true,
            cards: decryptedCards
        });
    } catch (error) {
        console.error('Fetch admin cards error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
