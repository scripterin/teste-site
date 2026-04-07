import { NextRequest, NextResponse } from 'next/server';
import { INTREBARI_RADIO } from '@/lib/questions/radio';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Shuffle determinist pe server folosind un seed bazat pe cod + id
// Astfel shuffle-ul e consistent între request-uri dar diferit per sesiune
function seededShuffle<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  // Hash simplu din seed
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

  // Amestecăm ordinea întrebărilor pe server (seed = cod sesiune)
  const intrebariAmestecate = seededShuffle(INTREBARI_RADIO, cod);
  const intrebare = intrebariAmestecate[index];

  // Amestecăm opțiunile pe server — fără raspunsCorect în răspuns!
  const optiuniAmestecate = seededShuffle(intrebare.optiuni, cod + index);

  return NextResponse.json({
    index,
    total: INTREBARI_RADIO.length,
    intrebare: intrebare.intrebare,
    optiuni: optiuniAmestecate,
    // ❌ raspunsCorect — NICIODATĂ trimis la client
  });
}
