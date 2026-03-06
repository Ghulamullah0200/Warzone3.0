import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Proxy as ProxyModel } from '../../../lib/models';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');

        // DB-level filter: forSale + exclude Pakistani country (consistent with cards)
        const filter = {
            forSale: true,
            country: { $not: { $regex: /^pakistan$/i } },
        };

        const total = await ProxyModel.countDocuments(filter);
        const proxies = await ProxyModel.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const sanitizedProxies = proxies.map(p => {
            // We DON'T decrypt sensitive data (host, user, pass) for the public marketplace
            // Users only see metadata until they buy it.
            return {
                id: p._id.toString(),
                title: p.title,
                price: p.price,
                description: p.description,
                type: p.type,
                country: p.country,
                state: p.state,
                city: p.city,
                createdAt: p.createdAt,
            };
        });

        return NextResponse.json({
            proxies: sanitizedProxies,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
            },
        });
    } catch (error) {
        console.error('Get proxies error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
