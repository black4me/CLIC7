import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Mock response for now to resolve build issues without nodemailer dependency

        return NextResponse.json({ success: true, message: 'Email sent (simulated)' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
