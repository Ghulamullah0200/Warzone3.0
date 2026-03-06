import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { Card } from '../../../../../lib/models';
import { encryptCardData } from '../../../../../lib/encryption';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const card = await Card.findByIdAndDelete(id);

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Card deleted successfully'
        });
    } catch (error) {
        console.error('Delete card error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const cardData = await req.json();

        // Encrypt sensitive data before saving
        const encryptedData = encryptCardData(cardData);

        const card = await Card.findByIdAndUpdate(id, encryptedData, { new: true });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Card updated successfully',
            card: {
                id: card._id.toString(),
                title: card.title,
                price: card.price
            }
        });
    } catch (error) {
        console.error('Update card error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
