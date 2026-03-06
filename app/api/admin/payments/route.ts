import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User, Payment } from '../../../../lib/models';

export async function GET() {
    try {
        await connectDB();

        const payments = await Payment.find().sort({ createdAt: -1 });

        const paymentData = await Promise.all(
            payments.map(async (payment: {
                _id: unknown;
                trxId: string;
                amount: number;
                type: string;
                status: string;
                userId?: string;
                createdAt: Date;
            }) => {
                let user = null;

                // 1st try: match by payment.userId (most reliable)
                if (payment.userId) {
                    user = await User.findById(payment.userId).select('username email status _id');
                }

                // 2nd try: for SIGNUP payments, the user's OWN trxId is their wallet address
                // but Payment.trxId is the transaction hash — they don't match.
                // Instead, look for any user whose _id equals payment.userId as string fallback.
                // If still null, try matching by the trxId stored on the USER document
                // (only works for SIGNUP type where user submitted their wallet trxId).
                if (!user && payment.type === 'SIGNUP') {
                    user = await User.findOne({ trxId: payment.trxId }).select('username email status _id');
                }

                return {
                    paymentId: payment._id,
                    trxId: payment.trxId,
                    amount: payment.amount,
                    type: payment.type,
                    paymentStatus: payment.status,
                    userId: user?._id?.toString() || payment.userId || 'N/A',
                    username: user?.username || 'N/A',
                    email: user?.email || 'N/A',
                    userStatus: user?.status || 'N/A',
                    createdAt: payment.createdAt,
                };
            })
        );

        return NextResponse.json({ payments: paymentData });
    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
