import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Proxy } from '../../../../lib/models';
import { encryptProxyData, decryptProxyData } from '../../../../lib/encryption';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const proxyData = await req.json();

        // Encrypt sensitive data before saving
        const encryptedData = encryptProxyData(proxyData);

        // Create new proxy with encrypted fields
        const proxy = await Proxy.create(encryptedData);

        return NextResponse.json({
            success: true,
            message: 'Proxy added successfully',
            proxy: {
                id: proxy._id.toString(),
                title: proxy.title,
                price: proxy.price
            }
        });
    } catch (error) {
        console.error('Add proxy error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        // Sort by forSale (true first), then createdAt (-1 for new first)
        const proxies = await Proxy.find({}).sort({ forSale: -1, createdAt: -1 });

        const decryptedProxies = proxies.map(p => {
            const decrypted = decryptProxyData(p);
            return {
                ...decrypted,
                id: p._id.toString(),
                _id: p._id.toString()
            };
        });

        return NextResponse.json({
            success: true,
            proxies: decryptedProxies
        });
    } catch (error) {
        console.error('Fetch admin proxies error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
