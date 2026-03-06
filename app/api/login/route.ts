import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { User } from '../../../lib/models';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Try to find user by username OR email
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ],
            password: password
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check account expiry
        if (user.accountExpiresAt && new Date() > new Date(user.accountExpiresAt)) {
            return NextResponse.json({ error: 'Account expired. Please renew subscription.' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                status: user.status,
                balance: user.balance || 0
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
