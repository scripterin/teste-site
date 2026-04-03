import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';
import { sendRezultatEmbed, sendRaportConducereEmbed } from '@/lib/discordBot';

const COOLDOWN_ZILE = {
  'RADIO': 3,
  'BLS': 3,
  'SMULS TEORETIC': 5,
  'REZIDENȚIAT': 5,
};

function getCooldownDate(testName) {
  const zile = COOLDOWN_ZILE[testName] || 3;

  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + (zile - 1));
  end.setHours(23, 59, 59, 999);

  return end;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
    }

    const body = await request.json();
    const { cod, greseli, timpRamas, intrebariGresite, motiv } = body;

    if (!cod) {
      return NextResponse.json({ error: 'Codul lipsește din request.' }, { status: 400 });
    }

    await connectDB();

    const userId = session.user.discordId;
    const username = session.user.username || session.user.name;

    // Caută codul indiferent de starea `used` — fix principal
    // Validate-code marchează used:true, dar dacă testul se termină
    // foarte repede (anticheat, 3 greșeli rapide), e posibil ca
    // PATCH-ul să nu fi ajuns încă sau să fi eșuat.
    const codeDoc = await Code.findOne({
      cod: cod.toUpperCase(),
      userId,
    });

    if (!codeDoc) {
      console.error(`[submit] Cod negăsit: ${cod} pentru userId: ${userId}`);
      return NextResponse.json({ error: 'Cod invalid sau testul nu a fost început corect.' }, { status: 400 });
    }

    // Dacă nu era marcat ca used, îl marcăm acum
    if (!codeDoc.used) {
      codeDoc.used = true;
      await codeDoc.save();
    }

    const admis = greseli <= 2 && motiv === 'finalizat';
    const rezultat = admis ? 'ADMIS' : 'RESPINS';
    const esteAnticheat = motiv === 'anticheat';

    if (!admis) {
      const cooldownPana = getCooldownDate(codeDoc.testSelectat);
      const cooldownStr = cooldownPana.toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Bucharest',
      });

      // Trimite ambele embeds în paralel și loghează erori
      const [rezPublic, rezConducere] = await Promise.allSettled([
        sendRezultatEmbed({
          username,
          userId,
          testName: codeDoc.testSelectat,
          rezultat,
          greseli,
          cooldownPana: cooldownStr,
        }),
        sendRaportConducereEmbed({
          username,
          userId,
          testName: codeDoc.testSelectat,
          rezultat,
          greseli,
          timpRamas,
          cooldownPana: cooldownStr,
          intrebariGresite: intrebariGresite || [],
          esteAnticheat,
        }),
      ]);

      if (rezPublic.status === 'rejected') {
        console.error('[submit] sendRezultatEmbed failed:', rezPublic.reason);
      }
      if (rezConducere.status === 'rejected') {
        console.error('[submit] sendRaportConducereEmbed failed:', rezConducere.reason);
      }

      return NextResponse.json({
        success: true,
        rezultat,
        cooldownPana: cooldownPana.toISOString(),
      });
    }

    // ─── ADMIS ────────────────────────────────────────────────────────────────
    const [rezPublic, rezConducere] = await Promise.allSettled([
      sendRezultatEmbed({
        username,
        userId,
        testName: codeDoc.testSelectat,
        rezultat,
        greseli,
        cooldownPana: null,
      }),
      sendRaportConducereEmbed({
        username,
        userId,
        testName: codeDoc.testSelectat,
        rezultat,
        greseli,
        timpRamas,
        cooldownPana: null,
        intrebariGresite: intrebariGresite || [],
        esteAnticheat: false,
      }),
    ]);

    if (rezPublic.status === 'rejected') {
      console.error('[submit] sendRezultatEmbed failed:', rezPublic.reason);
    }
    if (rezConducere.status === 'rejected') {
      console.error('[submit] sendRaportConducereEmbed failed:', rezConducere.reason);
    }

    return NextResponse.json({ success: true, rezultat });

  } catch (error) {
    console.error('Eroare submit test:', error);
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}