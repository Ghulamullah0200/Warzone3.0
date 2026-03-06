import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Setting } from '../../../lib/models';

export async function GET() {
    try {
        await connectDB();
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({ signupAmount: 2000, minDepositAmount: 7000 });
        }
        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const { signupAmount, minDepositAmount } = await req.json();

        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({ signupAmount: 2000, minDepositAmount: 7000 });
        }

        if (signupAmount !== undefined) settings.signupAmount = signupAmount;
        if (minDepositAmount !== undefined) settings.minDepositAmount = minDepositAmount;
        
        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
