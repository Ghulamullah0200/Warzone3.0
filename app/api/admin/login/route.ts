import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'sup_warzone';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'War_&_Roar23';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            return NextResponse.json({
                success: true,
                message: 'Admin login successful',
            });
        } else {
            return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
