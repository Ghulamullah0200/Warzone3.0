import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectDB();
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        return NextResponse.json({
            status: 'ok',
            dbState: states[mongoose.connection.readyState],
            time: new Date().toISOString()
        });
    } catch (error: unknown) {
        console.error('Health check error:', error);
        return NextResponse.json({
            status: 'error',
            message: (error as Error).message,
            stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
        }, { status: 500 });
    }
}
