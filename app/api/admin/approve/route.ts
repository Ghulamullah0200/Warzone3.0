import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User, Payment } from '../../../../lib/models';
import { sendApprovalEmail } from '../../../../lib/emailService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { trxId } = body;

        console.log("Received approval request for:", trxId); // Debug log

        if (!trxId) {
            return NextResponse.json({ error: 'TRX ID is missing from request body' }, { status: 400 });
        }

        await connectDB();

        const payment = await Payment.findOne({ trxId });
        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (payment.status === 'APPROVED') {
            return NextResponse.json({ error: 'Payment already approved' }, { status: 400 });
        }

        if (payment.type === 'DEPOSIT') {
            if (!payment.userId) {
                return NextResponse.json({ error: 'Deposit payment missing user ID' }, { status: 400 });
            }

            const user = await User.findById(payment.userId);
            if (!user) {
                return NextResponse.json({ error: 'User not found for this deposit' }, { status: 404 });
            }

            // Add balance
            user.balance = (user.balance || 0) + payment.amount;
            payment.status = 'APPROVED';

            await user.save();
            await payment.save();

            return NextResponse.json({
                success: true,
                message: 'Deposit approved and balance updated',
            });
        } else if (payment.type === 'SIGNUP') {
            // SIGNUP type
            const user = await User.findOne({ trxId });

            if (!user) {
                console.warn('User not found for signup approval:', trxId);
                return NextResponse.json({ error: 'User link missing for this signup' }, { status: 404 });
            }

            user.status = 'APPROVED';
            // Set expiry if not set
            if (!user.accountExpiresAt) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                user.accountExpiresAt = expiryDate;
            }

            await user.save();

            // Send email
            try {
                if (user.email && user.username) {
                    await sendApprovalEmail(user.email, user.username);
                }
            } catch (emailError) {
                console.error('Email failed but user approved:', emailError);
            }

            payment.status = 'APPROVED';
            await payment.save();

            return NextResponse.json({
                success: true,
                message: 'User signup approved successfully',
            });
        } else if (payment.type === 'RENEW') {
            if (!payment.userId) {
                return NextResponse.json({ error: 'Renew payment missing user ID' }, { status: 400 });
            }

            const user = await User.findById(payment.userId);
            if (!user) {
                return NextResponse.json({ error: 'User not found for renewal' }, { status: 404 });
            }

            // Extend expiry by 30 days from now
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            user.accountExpiresAt = expiryDate;

            // Just in case user was NOT_APPROVED previously
            user.status = 'APPROVED';

            await user.save();

            payment.status = 'APPROVED';
            await payment.save();

            // Optionally send renewal email if you want, skipping for simplicity unless needed
            return NextResponse.json({
                success: true,
                message: 'Account renewal approved successfully',
            });
        }

        return NextResponse.json({ error: 'Unknown payment type' }, { status: 400 });
    } catch (error) {
        console.error('Approve error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { trxId } = body;

        await connectDB();

        if (!trxId) {
            return NextResponse.json({ error: 'TRX ID is required' }, { status: 400 });
        }

        // Find the payment
        const payment = await Payment.findOne({ trxId });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // If it's a signup payment, we might want to delete the user too or set them to rejected
        if (payment.type === 'SIGNUP') {
            await User.deleteOne({ trxId });
        }

        await Payment.deleteOne({ trxId });

        return NextResponse.json({ success: true, message: 'Payment rejected and deleted' });
    } catch (error) {
        console.error('Reject error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
