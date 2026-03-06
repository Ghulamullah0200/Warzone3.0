import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { User, Payment } from '../../../lib/models';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { username, email, password, trxId } = await req.json();

        // Check individual fields
        const missingFields = [];
        if (!username) missingFields.push('username');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!trxId) missingFields.push('trxId');

        if (missingFields.length > 0) {
            return NextResponse.json({
                error: `Missing fields: ${missingFields.join(', ')}`,
                details: missingFields
            }, { status: 400 });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        const payment = await Payment.findOne({ trxId });
        if (!payment) {
            return NextResponse.json({ error: 'Invalid TRX ID' }, { status: 400 });
        }

        const user = await User.create({
            username,
            email,
            password,
            trxId,
            status: 'NOT_APPROVED',
            balance: 0,
            accountExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
        });

        return NextResponse.json({
            success: true,
            message: 'Signup successful. Awaiting approval.',
            userId: user._id,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
