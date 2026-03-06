import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { User, BundleOrder } from '../../../lib/models';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { userId, bundleTitle, cardCount, discount, originalPrice, price } = await req.json();

        if (!userId || !bundleTitle || !cardCount || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.status !== 'APPROVED') {
            return NextResponse.json({ error: 'User not approved' }, { status: 403 });
        }

        if (user.accountExpiresAt && new Date() > new Date(user.accountExpiresAt)) {
            return NextResponse.json({ error: 'Account expired. Please renew subscription.' }, { status: 403 });
        }

        if ((user.balance || 0) < price) {
            return NextResponse.json({
                error: `Insufficient funds. Required: $${price.toLocaleString()}, Available: $${(user.balance || 0).toLocaleString()}`
            }, { status: 400 });
        }

        // Deduct balance
        user.balance = (user.balance || 0) - price;
        await user.save();

        // Record bundle order
        const bundleOrder = await BundleOrder.create({
            userId: userId,
            username: user.username,
            bundleTitle,
            cardCount,
            discount,
            originalPrice,
            price,
        });

        return NextResponse.json({
            success: true,
            message: `Bundle "${bundleTitle}" purchased successfully!`,
            bundleOrder,
            newBalance: user.balance,
        });
    } catch (error: unknown) {
        console.error('Purchase bundle error:', error);
        return NextResponse.json({ error: 'Server error: ' + (error as Error).message }, { status: 500 });
    }
}
