import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Order } from '../../../../lib/models';
import { decrypt } from '../../../../lib/encryption';
export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find().sort({ purchaseDate: -1 }).limit(2000);
        const decryptedOrders = orders.map(order => {
            const data = order.toObject();
            return {
                ...data,
                id: data._id.toString(),
                cardNumber: decrypt(data.cardNumber),
                cvv: decrypt(data.cvv),
                holder: decrypt(data.holder),
                address: decrypt(data.address),
                ssn: decrypt(data.ssn),
                dob: decrypt(data.dob),
                email: decrypt(data.email),
                phone: decrypt(data.phone),
                password: decrypt(data.password),
                ip: decrypt(data.ip),
                proxy: decrypt(data.proxy),
            };
        });
        return NextResponse.json({ orders: decryptedOrders });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
