import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { ActivityLog } from '../../../../lib/models';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const activities = await ActivityLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 activities for performance

        return NextResponse.json({ activities });
    } catch (error: unknown) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity logs', details: (error as Error).message },
            { status: 500 }
        );
    }
}
