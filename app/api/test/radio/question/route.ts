import { NextRequest, NextResponse } from 'next/server';
import { INTREBARI_RADIO } from '@/lib/questions/radio';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';

function seededShuffle<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    hash = ((hash * 1664525) + 1013904223) | 0;
    const j = Math.abs(hash) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const index = Number(searchParams.get('index') ?? '0');
  const cod = searchParams.get('cod') ?? 'default';

  if (index < 0 || index >= INTREBARI_RADIO.length) {
    return NextResponse.json({ error: 'Întrebare inexistentă' }, { status: 404 });
  }

  if (index === 0) {
    await connectDB();
    const userId = (session.user as any).discordId;
    const codeDoc = await Code.findOne({
      cod: cod.toUpperCase(),
      userId,
      expiresAt: { $gt: new Date() }, 
    });

    if (!codeDoc) {
      return NextResponse.json({ error: 'Cod invalid sau expirat.' }, { status: 403 });
    }

    if (codeDoc.used) {
      return NextResponse.json({ error: 'Testul a fost deja început. Nu poți da refresh.' }, { status: 403 });
    }

    codeDoc.used = true;
    await codeDoc.save();
  }

  const intrebariAmestecate = seededShuffle(INTREBARI_RADIO, cod);
  const intrebare = intrebariAmestecate[index];
  const optiuniAmestecate = seededShuffle(intrebare.optiuni, cod + index);

  return NextResponse.json({
    index,
    total: INTREBARI_RADIO.length,
    intrebare: intrebare.intrebare,
    optiuni: optiuniAmestecate,
  });
}