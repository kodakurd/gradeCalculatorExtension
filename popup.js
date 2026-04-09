
// Hent aktiv fane og kjør innhentingskoden på StudentWeb-siden
const GRADE_COLORS = {
    A: '#1a7a4a', B: '#2271c3', C: '#6b4fc2',
    D: '#c27a10', E: '#c24010', F: '#999'
};

// Hent aktiv fane og kjør innhentingskoden på StudentWeb-siden
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
        { target: { tabId: tabs[0].id }, func: hentData },
        (resultater) => {
            if (resultater && resultater[0]?.result?.resultater?.length > 0) {
                visData(resultater[0].result);
            } else {
                document.getElementById('innhold').style.display = 'none';
                document.getElementById('feil').style.display = 'block';
            }
        }
    );
});

// Denne funksjonen kjøres inne på StudentWeb-siden
function hentData() {
    const GRADE_VAL = { A: 5, B: 4, C: 3, D: 2, E: 1 };
    const rader = document.querySelectorAll('tr.resultatTop, tr.none');
    const resultater = [];

    rader.forEach((rad) => {
        // Prøv infoLinje først (tr.none), fall tilbake på innerText (tr.resultatTop)
        const infoLinjer = rad.querySelectorAll('td.col2Emne div.infoLinje');
        const emne = infoLinjer.length > 0
            ? infoLinjer[infoLinjer.length - 1].innerText.trim()
            : rad.querySelector('td.col2Emne')?.innerText.trim().split('\n').filter(l => l.trim().length > 0)[0]?.trim();

        const karakter = rad.querySelector('td.col6Resultat div.infoLinje span')?.innerText.trim();
        const spTekst = rad.querySelector('td.col7Studiepoeng span')?.innerText.trim();
        const studiepoeng = parseFloat(spTekst?.replace(',', '.'));

        if (emne && karakter) {
            // Behold kun beste karakter ved kontinuasjon
            const eksisterende = resultater.findIndex(r => r.emne === emne);
            if (eksisterende !== -1) {
                const gammelVerdi = GRADE_VAL[resultater[eksisterende].karakter] ?? 0;
                const nyVerdi = GRADE_VAL[karakter] ?? 0;
                if (nyVerdi > gammelVerdi) resultater[eksisterende] = { emne, karakter, studiepoeng };
            } else {
                resultater.push({ emne, karakter, studiepoeng });
            }
        }
    });

    // Regn ut vektet snitt
    let vektetSum = 0, totalSp = 0;
    resultater.forEach((r) => {
        const verdi = GRADE_VAL[r.karakter];
        if (verdi !== undefined && r.studiepoeng) {
            vektetSum += verdi * r.studiepoeng;
            totalSp += r.studiepoeng;
        }
    });

    const snitt = totalSp > 0 ? (vektetSum / totalSp).toFixed(2) : null;
    return { resultater, snitt, totalSp };
}

// Konverter tallsnitt til bokstavkarakter
function bokstavFraTall(n) {
    if (n >= 4.5) return 'A';
    if (n >= 3.5) return 'B';
    if (n >= 2.5) return 'C';
    if (n >= 1.5) return 'D';
    if (n >= 0.5) return 'E';
    return 'F';
}

// Vis dataene i popup-vinduet
function visData({ resultater, snitt, totalSp }) {
    // Snitt-seksjon
    document.getElementById('avg-num').textContent = snitt ?? '—';
    if (snitt) {
        const bokstav = bokstavFraTall(parseFloat(snitt));
        document.getElementById('avg-letter').textContent = bokstav;
        document.getElementById('avg-letter').style.color = GRADE_COLORS[bokstav] ?? '#555';
    }
    const beståttSp = resultater
        .filter(r => r.karakter !== 'F' && r.karakter !== 'Ikke bestått')
        .reduce((s, r) => s + (r.studiepoeng || 0), 0);
    document.getElementById('avg-meta').textContent =
        `${beståttSp} studiepoeng bestått · ${resultater.length} emner`;

    // Karakterfordeling-bar
    const GRADE_VAL_DISPLAY = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    resultater.forEach(r => {
        if (r.karakter in GRADE_VAL_DISPLAY) GRADE_VAL_DISPLAY[r.karakter]++;
    });
    const total = resultater.length;
    const bar = document.getElementById('grade-bar');
    const legend = document.getElementById('bar-legend');
    Object.entries(GRADE_VAL_DISPLAY).forEach(([g, count]) => {
        if (count === 0) return;
        const seg = document.createElement('div');
        seg.className = 'bar-seg';
        seg.style.flex = count / total;
        seg.style.background = GRADE_COLORS[g];
        bar.appendChild(seg);

        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<div class="legend-dot" style="background:${GRADE_COLORS[g]}"></div>${g}: ${count}`;
        legend.appendChild(item);
    });

    // Emneoversikt
    const tabell = document.getElementById('tabell');
    resultater.forEach((r) => {
        const rad = document.createElement('div');
        rad.className = 'table-row';
        const gradClass = r.karakter in GRADE_COLORS ? `grade-${r.karakter}` : 'grade-other';
        rad.innerHTML = `
      <span class="row-emne" title="${r.emne}">${r.emne}</span>
      <span class="row-karakter ${gradClass}">${r.karakter}</span>
      <span class="row-sp">${r.studiepoeng ?? '—'}</span>
    `;
        tabell.appendChild(rad);
    });
}
