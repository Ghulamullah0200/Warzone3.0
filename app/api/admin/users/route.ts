import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../lib/models';

export async function GET() {
    try {
        await connectDB();

        // Fetch users
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        // Count for debug
        console.log(`API: Fetching users. Found ${users.length} users.`);

        return NextResponse.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error: unknown) {
        console.error('API Error: Failed to fetch users:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch users',
            details: (error as Error).message
        }, { status: 500 });
    }
}
