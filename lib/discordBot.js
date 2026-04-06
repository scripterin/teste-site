/**
 * Trimite codul generat pe Discord (pentru evidența cererilor)
 */
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

/**
 * Trimite rezultatul public (ADMIS/RESPINS) pe canalul de rezultate
 */
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

/**
 * Trimite raportul detaliat către Conducere, incluzând logica de Anti-Cheat (Refresh/Tab)
 */
export async function sendRaportConducereEmbed({ 
  username, 
  userId, 
  testName, 
  rezultat, 
  greseli, 
  timpRamas, 
  cooldownPana, 
  intrebariGresite, 
  esteAnticheat, 
  motiv 
}) {
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
      { name: 'Greșeli', value: `${greseli}/3`, inline: true },
      { name: 'Timp rămas', value: `${timpRamas} secunde`, inline: true },
    ];

    // --- SECȚIUNE ANTICHEAT ---
    if (esteAnticheat) {
      let descriereAnticheat = '';
      
      // Verificăm motivul trimis din API
      if (motiv === 'refresh_pagina') {
        descriereAnticheat = '🚨 **Candidatul a dat REFRESH la pagină sau a încercat să o închidă.**';
      } else if (motiv === 'anticheat') {
        descriereAnticheat = '📱 **Candidatul a SCHIMBAT TAB-UL sau a părăsit fereastra de test.**';
      } else if (motiv === 'timp_expirat') {
        descriereAnticheat = '⌛ **Timpul de lucru a expirat înainte de finalizare.**';
      } else {
        descriereAnticheat = '⚠️ **Tentativă de părăsire a testului detectată de sistem.**';
      }

      fields.push({
        name: '⚠️ ALERTĂ FRAUDĂ / ABATERI',
        value: descriereAnticheat,
        inline: false,
      });
    }

    // --- SECȚIUNE GREȘELI ---
    if (intrebariGresite && intrebariGresite.length > 0) {
      const continut = intrebariGresite.map((item, index) =>
        `**${index + 1}. ${item.intrebare || 'Întrebare lipsă'}**\n└ Răspuns corect: \`${item.raspunsCorect || '—'}\`\n└ Răspuns utilizator: \`${item.raspunsdat || '—'}\``
      ).join('\n\n');

      // Securitate pentru limita de caractere Discord (1024)
      fields.push({
        name: '❌ Greșeli înregistrate',
        value: continut.length > 1024 ? continut.substring(0, 1020) + "..." : continut,
        inline: false,
      });
    }

    const embed = {
      title: esteAnticheat ? '🚨 Raport Conducere - ANTICHEAT DETECTAT' : '📊 Raport Conducere - Rezultat Test',
      color: esteAnticheat ? 0xFF0000 : (admis ? 0x57F287 : 0xED4245),
      fields,
      footer: {
        text: `Departamentul Medical FPlayT • ${timeStr}`,
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