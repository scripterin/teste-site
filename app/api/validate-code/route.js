import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';

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
    const { cod } = body;

    if (!cod || cod.trim().length === 0) {
      return NextResponse.json(
        { error: 'Introdu un cod valid.' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = session.user.discordId;
    const codUpper = cod.trim().toUpperCase();

    // Caută codul în baza de date
    const codeDoc = await Code.findOne({ cod: codUpper });

    if (!codeDoc) {
      return NextResponse.json(
        { error: 'Codul nu există. Verifică și încearcă din nou.' },
        { status: 404 }
      );
    }

    // Verifică dacă aparține utilizatorului curent
    if (codeDoc.userId !== userId) {
      return NextResponse.json(
        { error: 'Acest cod nu îți aparține.' },
        { status: 403 }
      );
    }

    // Verifică dacă a fost deja folosit
    if (codeDoc.used) {
      return NextResponse.json(
        { error: 'Codul a fost deja folosit.' },
        { status: 410 }
      );
    }

    // Verifică dacă nu a expirat
    if (new Date() > codeDoc.expiresAt) {
      return NextResponse.json(
        { error: 'Codul a expirat. Solicită un cod nou.' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cod valid! Poți începe testul.',
      testSelectat: codeDoc.testSelectat,
      expiresAt: codeDoc.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Eroare validate-code:', error);
    return NextResponse.json(
      { error: 'Eroare internă de server. Încearcă din nou.' },
      { status: 500 }
    );
  }
}

// Marchează codul ca folosit (apelat la start test)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
    }

    const body = await request.json();
    const { cod } = body;

    await connectDB();

    const userId = session.user.discordId;
    const codUpper = cod.trim().toUpperCase();

    const updated = await Code.findOneAndUpdate(
      { cod: codUpper, userId, used: false },
      { used: true },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Codul nu a putut fi marcat ca folosit.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Eroare PATCH validate-code:', error);
    return NextResponse.json({ error: 'Eroare server.' }, { status: 500 });
  }
}