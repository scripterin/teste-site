import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { cod, image, timestamp, intrebareIndex, timpRamas } = await req.json();

    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();

    const embed = {
      title: '🚨 ANTICHEAT — Screenshot Dovadă',
      color: 0xFEE75C,
      fields: [
        { name: 'Cod', value: cod, inline: true },
        { name: 'Ora detectării', value: timestamp, inline: true },
        { name: 'Întrebarea', value: `${intrebareIndex}`, inline: true },
        { name: 'Timp rămas', value: `${timpRamas}s`, inline: true },
      ],
      image: { url: 'attachment://anticheat.png' },
      footer: { text: 'Departamentul Medical FPlayT' },
      timestamp: new Date().toISOString(),
    };

    formData.append('payload_json', JSON.stringify({ embeds: [embed] }));
    formData.append('files[0]', new Blob([buffer], { type: 'image/png' }), 'anticheat.png');

    const res = await fetch(process.env.DISCORD_WEBHOOK_CONDUCERE!, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.error('Webhook screenshot error:', res.status, await res.text());
      return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Eroare anticheat screenshot:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}