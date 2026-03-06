import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../lib/models';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                status: user.status,
                balance: user.balance || 0
            }
        });
    } catch (error) {
        console.error('Fetch user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
