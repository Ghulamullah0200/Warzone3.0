import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { ProxyOrder } from '../../../../lib/models';
import { decrypt } from '../../../../lib/encryption';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');

        await connectDB();

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            ProxyOrder.find({ userId })
                .sort({ purchaseDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ProxyOrder.countDocuments({ userId })
        ]);

        const decryptedOrders = orders.map((order: { _id: { toString: () => string }; host: string; port: string; username_proxy: string; password_proxy: string;[key: string]: unknown }) => ({
            ...order,
            id: order._id.toString(),
            host: decrypt(order.host),
            port: decrypt(order.port),
            username_proxy: decrypt(order.username_proxy),
            password_proxy: decrypt(order.password_proxy),
        }));

        return NextResponse.json({
            orders: decryptedOrders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
            },
        });
    } catch (error) {
        console.error('Get proxy orders error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
