import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User, Payment } from '../../../../lib/models';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');
        const skip = (page - 1) * limit;

        await connectDB();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({
                payments: [],
                pagination: { total: 0, pages: 0, current: page }
            });
        }

        const query = {
            $or: [
                { userId: userId },
                { trxId: user.trxId }
            ]
        };

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Payment.countDocuments(query)
        ]);

        return NextResponse.json({
            payments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        });
    } catch (error) {
        console.error('Get user payments error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
