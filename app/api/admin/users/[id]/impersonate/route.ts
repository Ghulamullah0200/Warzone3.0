import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../../lib/db';
import { User, ActivityLog } from '../../../../../../lib/models'; // Added ActivityLog

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const user = await User.findById(id).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Log the activity
        await ActivityLog.create({
            userId: user._id,
            action: 'ADMIN_IMPERSONATION',
            details: 'Admin started an impersonation session',
            ip: req.headers.get('x-forwarded-for') || '::1'
        });

        // Return user object so frontend can set session
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Impersonate user error:', error);
        return NextResponse.json({ error: 'Failed to impersonate user' }, { status: 500 });
    }
}
