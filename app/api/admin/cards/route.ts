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
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        // Count total for pagination
        const total = await Card.countDocuments({});

        // Sort by forSale (true first), then createdAt (-1 for new first)
        const cards = await Card.find({})
            .sort({ forSale: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

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
            cards: decryptedCards,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch admin cards error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
