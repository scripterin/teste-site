import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';
import Cooldown from '@/models/Cooldown';
import { sendCodeEmbed } from '@/lib/discordBot';

const COOLDOWN_MS = 90 * 1000; // 1 minut și 30 secunde

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Neautorizat. Te rugăm să te loghezi.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { testSelectat } = body;

    const validTests = ['RADIO', 'BLS', 'REZIDENȚIAT', 'SMULS TEORETIC'];
    if (!testSelectat || !validTests.includes(testSelectat)) {
      return NextResponse.json(
        { error: 'Test invalid. Selectează un test valid.' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId   = session.user.discordId;
    const username = session.user.username || session.user.name;
    const now      = new Date();

    const cooldownDoc = await Cooldown.findOne({ userId });
    if (cooldownDoc) {
      const elapsed = now.getTime() - cooldownDoc.lastRequestAt.getTime();
      if (elapsed < COOLDOWN_MS) {
        const retryAfterSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: `Mai trebuie să aștepți ${retryAfterSeconds} secunde înainte de a solicita alt cod.`,
            retryAfterSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Marcăm momentul cererii ÎNAINTE de a genera codul
    await Cooldown.findOneAndUpdate(
      { userId },
      { userId, lastRequestAt: now },
      { upsert: true }
    );

    await Code.deleteMany({ userId });

    let cod;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      cod = generateCode();
      const existing = await Code.findOne({ cod });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Nu s-a putut genera un cod unic. Încearcă din nou.' },
        { status: 500 }
      );
    }

    const CODE_EXPIRY_MS = 5 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MS);

    await Code.create({
      userId,
      username,
      testSelectat,
      cod,
      createdAt: now,
      expiresAt,
      used: false,
    });

    await sendCodeEmbed({
      username,
      userId,
      testName: testSelectat,
      code: cod,
    });

    return NextResponse.json({
      success: true,
      message: 'Codul a fost trimis pe Discord! Verifică mesajele private.',
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Eroare generate-code:', error);
    return NextResponse.json(
      { error: 'Eroare internă de server. Încearcă din nou.' },
      { status: 500 }
    );
  }
}