import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
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

  const acumRO = new Date().toLocaleDateString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [zi, luna, an] = acumRO.split('.').map(Number);

  const dataFinala = new Date(Date.UTC(an, luna - 1, zi));
  dataFinala.setUTCDate(dataFinala.getUTCDate() + zile - 1);
  dataFinala.setUTCHours(23, 59, 59, 999);

  return dataFinala;
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

    const codeDoc = await Code.findOne({
      cod: cod.toUpperCase(),
      userId,
    });

    if (!codeDoc) {
      console.error(`[submit] Cod negăsit: ${cod} pentru userId: ${userId}`);
      return NextResponse.json({ error: 'Cod invalid sau testul nu a fost început corect.' }, { status: 400 });
    }

    if (!codeDoc.used) {
      codeDoc.used = true;
      await codeDoc.save();
    }

    const pragGreseli = codeDoc.testSelectat === 'RADIO' ? 2 : 3;
    const admis = greseli <= pragGreseli && motiv === 'finalizat';

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

      if (rezPublic.status === 'rejected') console.error('[submit] sendRezultatEmbed failed:', rezPublic.reason);
      if (rezConducere.status === 'rejected') console.error('[submit] sendRaportConducereEmbed failed:', rezConducere.reason);

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

    if (rezPublic.status === 'rejected') console.error('[submit] sendRezultatEmbed failed:', rezPublic.reason);
    if (rezConducere.status === 'rejected') console.error('[submit] sendRaportConducereEmbed failed:', rezConducere.reason);

    return NextResponse.json({ success: true, rezultat });

  } catch (error) {
    console.error('Eroare submit test:', error);
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}