import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';
import { sendRezultatEmbed, sendRaportConducereEmbed } from '@/lib/discordBot';

const COOLDOWN_ZILE = { 'RADIO': 3, 'BLS': 3, 'SMULS TEORETIC': 5, 'REZIDENȚIAT': 5 };

function getCooldownDate(testName) {
  const zile = COOLDOWN_ZILE[testName] || 3;
  const acumRO = new Date().toLocaleDateString('ro-RO', { timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [zi, luna, an] = acumRO.split('.').map(Number);
  const dataFinala = new Date(Date.UTC(an, luna - 1, zi));
  dataFinala.setUTCDate(dataFinala.getUTCDate() + zile - 1);
  dataFinala.setUTCHours(23, 59, 59, 999);
  return dataFinala;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });

    const body = await request.json();
    const { cod, greseli, timpRamas, intrebariGresite, motiv } = body;
    if (!cod) return NextResponse.json({ error: 'Cod lipsă.' }, { status: 400 });

    await connectDB();
    const userId = session.user.discordId;
    const username = session.user.username || session.user.name;

    const codeDoc = await Code.findOne({ cod: cod.toUpperCase(), userId });
    if (!codeDoc) return NextResponse.json({ error: 'Cod invalid.' }, { status: 400 });

    // --- PROTECȚIE: DACĂ E DEJA FOLOSIT, NU MAI FACEM NIMIC ---
    if (codeDoc.used) {
        return NextResponse.json({ error: 'Test deja finalizat.' }, { status: 400 });
    }

    // Marcăm IMEDIAT ca folosit
    codeDoc.used = true;
    await codeDoc.save();

    const pragGreseli = codeDoc.testSelectat === 'RADIO' ? 2 : 3;
    
    // LOGICA ANTICHEAT NOUĂ
    const esteAnticheat = (motiv === 'anticheat' || motiv === 'refresh_pagina');
    const admis = !esteAnticheat && greseli <= pragGreseli && motiv === 'finalizat';

    const rezultatLabel = admis ? 'ADMIS' : (esteAnticheat ? 'RESPINS (ANTICHEAT)' : 'RESPINS');
    const explicatieAnticheat = motiv === 'refresh_pagina' ? 'Candidatul a dat refresh la pagină în timpul testului.' : 'Candidatul a părăsit pagina (Tab Switch).';

    const cooldownPana = getCooldownDate(codeDoc.testSelectat);
    const cooldownStr = cooldownPana.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Bucharest' });

    // Trimitere Embeds
    await Promise.allSettled([
      sendRezultatEmbed({
        username, userId, testName: codeDoc.testSelectat,
        rezultat: rezultatLabel, greseli,
        cooldownPana: admis ? null : cooldownStr,
      }),
      sendRaportConducereEmbed({
        username, userId, testName: codeDoc.testSelectat,
        rezultat: rezultatLabel, greseli, timpRamas,
        cooldownPana: admis ? null : cooldownStr,
        intrebariGresite: intrebariGresite || [],
        esteAnticheat: esteAnticheat,
        motivAnticheat: esteAnticheat ? explicatieAnticheat : null // Trimitem motivul exact
      }),
    ]);

    return NextResponse.json({ success: true, rezultat: rezultatLabel });
  } catch (error) {
    console.error('Eroare submit:', error);
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}