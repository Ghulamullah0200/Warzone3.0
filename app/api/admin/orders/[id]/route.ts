import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { Order } from '../../../../../lib/models';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await context.params;
        const body = await req.json();

        // Update the order with fields that are allowed to be updated.
        // Usually, we wouldn't let price or purchaseDate change unless admin.
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                cardTitle: body.cardTitle,
                price: body.price,
                purchaseDate: body.purchaseDate
            },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await context.params;

        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
