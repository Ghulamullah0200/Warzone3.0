import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User, Proxy, ProxyOrder } from '../../../../lib/models';
import { decrypt } from '../../../../lib/encryption';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, proxyId } = await req.json();

        if (!userId || !proxyId) {
            return NextResponse.json({ error: 'User ID and Proxy ID are required' }, { status: 400 });
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

        const proxy = await Proxy.findById(proxyId);
        if (!proxy) {
            return NextResponse.json({ error: 'Proxy not found' }, { status: 404 });
        }

        if (!proxy.forSale) {
            return NextResponse.json({ error: 'Proxy already sold' }, { status: 400 });
        }

        if ((user.balance || 0) < proxy.price) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
        }

        // Deduct balance
        user.balance = (user.balance || 0) - proxy.price;
        await user.save();

        // Mark proxy as sold
        proxy.forSale = false;
        proxy.soldToUsername = user.username;
        proxy.soldToEmail = user.email;
        proxy.soldAt = new Date();
        await proxy.save();

        // Create Order/Receipt
        const order = await ProxyOrder.create({
            userId,
            username: user.username,
            proxyId,
            proxyTitle: proxy.title,
            host: proxy.host,
            port: proxy.port,
            username_proxy: proxy.username,
            password_proxy: proxy.password,
            type: proxy.type,
            country: proxy.country,
            state: proxy.state,
            city: proxy.city,
            price: proxy.price,
            purchaseDate: new Date(),
            pdfUrl: proxy.pdfUrl,
        });

        const orderData = order.toObject();

        return NextResponse.json({
            success: true,
            message: 'Purchase successful',
            order: {
                ...orderData,
                id: orderData._id.toString(),
                host: decrypt(orderData.host),
                port: decrypt(orderData.port),
                username_proxy: decrypt(orderData.username_proxy),
                password_proxy: decrypt(orderData.password_proxy),
            },
            newBalance: user.balance
        });
    } catch (error) {
        console.error('Proxy purchase error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
