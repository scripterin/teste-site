import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, timestamp, intrebareIndex, timpRamas } = await req.json();

    // 1. Pregătirea imaginii (Buffer)
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();

    // 2. Definirea Embed-ului (Am păstrat doar ce ai cerut)
    const embed = {
      title: '🚨 DOVADĂ FOTO — ANTICHEAT',
      color: 0xFEE75C, // Galben pentru avertisment
      fields: [
        { 
          name: 'Ora detectării', 
          value: timestamp, 
          inline: true 
        },
        { 
          name: 'Întrebarea curentă', 
          value: `Nr. ${intrebareIndex + 1}`, // +1 pentru a fi user-friendly (1, 2, 3...)
          inline: true 
        },
        { 
          name: 'Timp rămas', 
          value: `${timpRamas}s`, 
          inline: true 
        },
      ],
      image: { url: 'attachment://anticheat.png' },
      footer: { text: 'Sistem Monitorizare Departamentul Medical' },
      timestamp: new Date().toISOString(),
    };

    // 3. Construirea pachetului pentru Discord
    formData.append('payload_json', JSON.stringify({ embeds: [embed] }));
    
    // Notă: Folosim files[0] pentru compatibilitate maximă cu Discord API
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