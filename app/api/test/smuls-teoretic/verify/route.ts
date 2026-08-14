import { NextRequest, NextResponse } from 'next/server';
import { INTREBARI_SMULS } from '@/lib/questions/smuls';
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

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  if (!session) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const { index, raspunsUser, cod } = await req.json();

  if (typeof index !== 'number' || typeof raspunsUser !== 'string') {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  const intrebariAmestecate = seededShuffle(INTREBARI_SMULS, cod ?? 'default');
  const intrebare = intrebariAmestecate[index];

  if (!intrebare) {
    return NextResponse.json({ error: 'Întrebare inexistentă' }, { status: 404 });
  }

  const corect = raspunsUser.trim() === intrebare.raspunsCorect.trim();

  if (!corect && cod) {
    await connectDB();
    await (Code as any).updateOne(
      { cod: cod.toUpperCase(), userId: session.user.discordId },
      {
        $push: {
          greseliInregistrate: {
            index,
            intrebare: intrebare.intrebare,
            raspunsCorect: intrebare.raspunsCorect,
            raspunsUser,
          },
        },
      }
    );
  }

  return NextResponse.json({ corect });
}