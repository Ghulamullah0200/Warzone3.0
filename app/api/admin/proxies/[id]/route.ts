import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { Proxy, ProxyOrder } from '../../../../../lib/models';
import { encryptProxyData } from '../../../../../lib/encryption';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const proxy = await Proxy.findByIdAndDelete(id);

        if (!proxy) {
            return NextResponse.json({ error: 'Proxy not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Proxy deleted successfully'
        });
    } catch (error) {
        console.error('Delete proxy error:', error);
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
        const proxyData = await req.json();

        // Encrypt sensitive data before saving
        const encryptedData = encryptProxyData(proxyData);

        const proxy = await Proxy.findByIdAndUpdate(id, encryptedData, { new: true });

        // Synchronize pdfUrl to any existing ProxyOrders for this proxy
        if (encryptedData.pdfUrl || proxyData.pdfUrl) {
            await ProxyOrder.updateMany(
                { proxyId: id },
                { $set: { pdfUrl: encryptedData.pdfUrl || proxyData.pdfUrl } }
            );
        }

        if (!proxy) {
            return NextResponse.json({ error: 'Proxy not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Proxy updated successfully',
            proxy: {
                id: proxy._id.toString(),
                title: proxy.title,
                price: proxy.price
            }
        });
    } catch (error) {
        console.error('Update proxy error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
