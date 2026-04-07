export async function sendCodeEmbed({ username, userId, testName, code }) {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Bucharest',
    });

    const embed = {
      title: '📝 Cerere nouă de test',
      color: 0x00B4D8,
      fields: [
        { name: 'Utilizator', value: `<@${userId}>`, inline: true },
        { name: 'Test', value: testName, inline: true },
        { name: 'Cod generat', value: `\`\`\`${code}\`\`\``, inline: false },
      ],
      footer: {
        text: `Departamentul Medical FPlayT • ${timeStr}`,
      },
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '<@&825071956101169202>',
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      console.error('Webhook error:', res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Eroare webhook Discord:', error.message);
    return false;
  }
}

export async function sendRezultatEmbed({ username, userId, testName, rezultat, greseli, cooldownPana }) {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Bucharest',
    });

    const admis = rezultat === 'ADMIS';

    const fields = [
      { name: 'Utilizator', value: `<@${userId}>`, inline: true },
      { name: 'Test', value: testName, inline: true },
      { name: 'Rezultat', value: admis ? '**ADMIS**' : `**RESPINS** (cooldown până pe ${cooldownPana})`, inline: false },
    ];

    const embed = {
      title: admis ? '✅ Rezultat Test' : '❌ Rezultat Test',
      color: admis ? 0x57F287 : 0xED4245,
      fields,
      footer: {
        text: `Departamentul Medical FPlayT • ${timeStr}`,
      },
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(process.env.DISCORD_WEBHOOK_REZULTATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!res.ok) {
      console.error('Webhook rezultat error:', res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Eroare webhook rezultat:', error.message);
    return false;
  }
}

export async function sendRaportConducereEmbed({ username, userId, testName, rezultat, greseli, timpRamas, cooldownPana, intrebariGresite, esteAnticheat, motiv }) {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Bucharest',
      timeZoneName: 'short',
    });

    const admis = rezultat === 'ADMIS';

    const minute = Math.floor(timpRamas / 60);
    const secunde = timpRamas % 60;
    const timpFormatat = `${minute}:${secunde.toString().padStart(2, '0')}`;

    const fields = [
      { name: 'Utilizator', value: `<@${userId}>`, inline: true },
      { name: 'Test', value: testName, inline: true },
      { name: 'Rezultat', value: admis ? '**ADMIS**' : `**RESPINS** (cooldown până pe ${cooldownPana})`, inline: false },
      { name: 'Greșeli', value: `${greseli}/3`, inline: true },
      { name: 'Timp rămas', value: `⌛ ${timpFormatat} (${timpRamas}s)`, inline: true },
    ];

    if (esteAnticheat || motiv === 'refresh') {
      let descriereAnticheat = '';
      
      if (motiv === 'refresh') {
        descriereAnticheat = '🔴 **Candidatul a dat REFRESH la pagină.**';
      } else if (motiv === 'anticheat') {
        descriereAnticheat = '🟡 **Candidatul a părăsit tab-ul (Visibility Change).**';
      } else {
        descriereAnticheat = `⚠️ **Acțiune suspectă detectată: ${motiv || 'Necunoscută'}**`;
      }

      fields.push({
        name: '🚨 Sistem Anticheat',
        value: descriereAnticheat,
        inline: false,
      });
    }

    if (intrebariGresite && intrebariGresite.length > 0) {
      const continut = intrebariGresite.map((item, index) =>
        `**${index + 1}. ${item.intrebare || '—'}**\n❌ Răspuns dat: *${item.raspunsdat || '—'}*\n✅ Răspuns corect: *${item.raspunsCorect || '—'}*`
      ).join('\n\n');

      // Discord are limită de 1024 caractere per field. Tăiem dacă e prea lung.
      const continutSafe = continut.length > 1000 ? continut.substring(0, 990) + '...' : continut;

      fields.push({
        name: '📖 Detalii Greșeli',
        value: continutSafe,
        inline: false,
      });
    }

    const embed = {
      title: (esteAnticheat || motiv === 'refresh') ? '🚨 Raport Conducere - ANTICHEAT' : '📊 Raport Conducere - Rezultat Test',
      color: (esteAnticheat || motiv === 'refresh') ? 0xFEE75C : admis ? 0x57F287 : 0xED4245,
      fields,
      footer: {
        text: `Sistem Testare Medicală • ${timeStr}`,
      },
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(process.env.DISCORD_WEBHOOK_CONDUCERE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!res.ok) {
      console.error('Webhook conducere error:', res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Eroare webhook conducere:', error.message);
    return false;
  }
}