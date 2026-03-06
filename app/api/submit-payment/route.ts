import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Payment, Setting } from '../../../lib/models';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { trxId, amount } = await req.json();

        if (!trxId || !amount) {
            return NextResponse.json({ error: 'TRX ID and Amount are required' }, { status: 400 });
        }

        let settings = await Setting.findOne();
        if (!settings) {
            settings = { signupAmount: 2000 };
        }

        if (parseFloat(amount) !== settings.signupAmount) {
            return NextResponse.json({ error: `Invalid amount. Access fee is exactly $${settings.signupAmount}.` }, { status: 400 });
        }

        const existingPayment = await Payment.findOne({ trxId });
        if (existingPayment) {
            return NextResponse.json({ error: 'TRX ID already submitted' }, { status: 400 });
        }

        const payment = await Payment.create({
            trxId,
            amount,
            type: 'SIGNUP',
            status: 'PENDING'
        });

        return NextResponse.json({
            success: true,
            message: 'Payment submitted. Proceed to signup.',
            paymentId: payment._id,
        });
    } catch (error) {
        console.error('Payment submission error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
