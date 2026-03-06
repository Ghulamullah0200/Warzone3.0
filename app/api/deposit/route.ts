import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Payment, Setting } from '../../../lib/models';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, trxId, amount } = await req.json();

        if (!userId || !trxId || !amount) {
            return NextResponse.json({ error: 'User ID, TRX ID and Amount are required' }, { status: 400 });
        }

        const settings = await Setting.findOne();
        const minDeposit = settings ? settings.minDepositAmount : 7000;

        if (parseFloat(amount) < minDeposit) {
            return NextResponse.json({ error: `Amount is below the minimum required deposit of $${minDeposit}.` }, { status: 400 });
        }

        const existingPayment = await Payment.findOne({ trxId });
        if (existingPayment) {
            return NextResponse.json({ error: 'TRX ID already submitted' }, { status: 400 });
        }

        const payment = await Payment.create({
            trxId,
            amount: parseFloat(amount),
            type: 'DEPOSIT',
            userId,
            status: 'PENDING'
        });

        return NextResponse.json({
            success: true,
            message: 'Deposit submitted for approval',
            paymentId: payment._id
        });
    } catch (error) {
        console.error('Deposit error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
