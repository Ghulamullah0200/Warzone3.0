import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Payment, Setting, User } from '../../../lib/models';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { trxId, amount, username } = await req.json();

        if (!trxId || !amount || !username) {
            return NextResponse.json({ error: 'TRX ID, Amount, and Username are required' }, { status: 400 });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let settings = await Setting.findOne();
        if (!settings) {
            settings = { signupAmount: 2000 };
        }

        if (parseFloat(amount) !== settings.signupAmount) {
            return NextResponse.json({ error: `Invalid amount. Renewal fee is exactly $${settings.signupAmount}.` }, { status: 400 });
        }

        const existingPayment = await Payment.findOne({ trxId });
        if (existingPayment) {
            return NextResponse.json({ error: 'TRX ID already submitted' }, { status: 400 });
        }

        const payment = await Payment.create({
            trxId,
            amount,
            type: 'RENEW',
            userId: user._id,
            status: 'PENDING'
        });

        return NextResponse.json({
            success: true,
            message: 'Renewal payment submitted. Please wait for approval.',
            paymentId: payment._id,
        });
    } catch (error) {
        console.error('Renewal payment submission error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
