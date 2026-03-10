import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../lib/models';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        // Fetch users with pagination
        const total = await User.countDocuments({});
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Count for debug
        console.log(`API: Fetching users p:${page} l:${limit}. Found ${users.length}/${total} users.`);

        return NextResponse.json({
            success: true,
            count: users.length,
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
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
