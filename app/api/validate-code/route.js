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

    const codeDoc = await Code.findOne({ cod: codUpper });

    if (!codeDoc) {
      return NextResponse.json(
        { error: 'Codul nu există. Verifică și încearcă din nou.' },
        { status: 404 }
      );
    }

    if (codeDoc.userId !== userId) {
      return NextResponse.json(
        { error: 'Acest cod nu îți aparține.' },
        { status: 403 }
      );
    }

    if (codeDoc.used) {
      return NextResponse.json(
        { error: 'Codul a fost deja folosit.' },
        { status: 410 }
      );
    }

    // FIX: eliminat check expiresAt — expirarea e gestionată prin deleteMany la generare nouă

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