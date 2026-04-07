import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const cod = searchParams.get('cod');
    const session = await getServerSession(authOptions);

    if (!session || !cod) return NextResponse.json({ used: true });

    await connectDB();
    const codeDoc = await Code.findOne({ cod: cod.toUpperCase(), userId: session.user.discordId });
    
    return NextResponse.json({ used: codeDoc ? codeDoc.used : true });
}