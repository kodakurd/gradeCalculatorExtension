
const GRADE_VAL    = { A: 5, B: 4, C: 3, D: 2, E: 1 };
const GRADE_COLORS = { A: '#1a7a4a', B: '#2271c3', C: '#6b4fc2', D: '#c27a10', E: '#c24010', F: '#999' };
const ALLE_KARAKTERER = ['A', 'B', 'C', 'D', 'E', 'F', 'Bestått', 'Ikke bestått'];

// Global state
let alleResultater        = [];
let utelatt               = new Set();
let overstyrteKarakterer  = {};

// ─── Bootstrap ───────────────────────────────────────────────────────────────

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
        { target: { tabId: tabs[0].id }, func: hentData },
        (injected) => {
            if (injected && injected[0]?.result?.resultater?.length > 0) {
                alleResultater = injected[0].result.resultater;
                chrome.storage.local.get(['utelatt', 'overstyrte'], (lagret) => {
                    if (lagret.utelatt)   utelatt = new Set(lagret.utelatt);
                    if (lagret.overstyrte) overstyrteKarakterer = lagret.overstyrte;
                    visOversikt();
                    oppdaterSnittseksjon();
                });
            } else {
                document.getElementById('innhold').style.display = 'none';
                document.getElementById('feil').style.display    = 'block';
            }
        }
    );
});

// ─── Data parsing (kjøres inne på StudentWeb-siden) ──────────────────────────

function hentData() {
    const GRADE_VAL = { A: 5, B: 4, C: 3, D: 2, E: 1 };
    const resultater = [];
    const sett       = new Map(); // emne → index, for deduplication

    function leggTil(emne, karakter, studiepoeng) {
        if (!emne || !karakter) return;
        emne     = emne.trim();
        karakter = karakter.trim();
        if (!emne || !karakter) return;

        if (sett.has(emne)) {
            const idx      = sett.get(emne);
            const gammel   = GRADE_VAL[resultater[idx].karakter] ?? 0;
            const ny       = GRADE_VAL[karakter]                 ?? 0;
            if (ny > gammel) resultater[idx] = { emne, karakter, studiepoeng };
        } else {
            sett.set(emne, resultater.length);
            resultater.push({ emne, karakter, studiepoeng });
        }
    }

    // ── 1. Interne resultater (standard StudentWeb-klasser, gjelder alle FS-institusjoner) ──
    document.querySelectorAll('tr.resultatTop, tr.none').forEach((rad) => {
        const infoLinjer = rad.querySelectorAll('td.col2Emne div.infoLinje');
        const emne = infoLinjer.length > 0
            ? infoLinjer[infoLinjer.length - 1].innerText.trim()
            : rad.querySelector('td.col2Emne')?.innerText.trim()
                  .split('\n').filter(l => l.trim())[0]?.trim();

        const karakter   = rad.querySelector('td.col6Resultat div.infoLinje span')?.innerText.trim();
        const spTekst    = rad.querySelector('td.col7Studiepoeng span')?.innerText.trim();
        const studiepoeng = parseFloat(spTekst?.replace(',', '.'));

        leggTil(emne, karakter, studiepoeng);
    });

    // ── 2. Eksterne resultater (andre universiteter) ──────────────────────────
    // StudentWeb bruker eksakte kolonneklasser: col2EksternEmne, col3EksternResultat, col4EksternStudiepoeng
    document.querySelectorAll('td.col2EksternEmne').forEach((emneEl) => {
        const rad = emneEl.closest('tr');
        if (!rad) return;

        // Emnenavn – siste infoLinje inneholder fullt navn + universitetsnavn
        const infoLinjer = emneEl.querySelectorAll('div.infoLinje');
        const emne = infoLinjer.length > 0
            ? infoLinjer[infoLinjer.length - 1].innerText.trim()
            : emneEl.innerText.split('\n').map(s => s.trim()).filter(s => s).pop();

        // Karakter – siste ikke-tomme tekstlinje (hopp over aria-hidden "Resultat"-tittelen)
        const karakterEl = rad.querySelector('td.col3EksternResultat');
        const karakter = karakterEl?.innerText
            .split('\n').map(s => s.trim()).filter(s => s).pop();

        // Studiepoeng – siste ikke-tomme tekstlinje (hopp over "Studiepoeng"-span)
        const spEl = rad.querySelector('td.col4EksternStudiepoeng');
        const spTekst = spEl?.innerText
            .split('\n').map(s => s.trim()).filter(s => s).pop();
        const studiepoeng = parseFloat(spTekst?.replace(',', '.'));

        leggTil(emne, karakter, studiepoeng);
    });

    // Beregn vektet snitt
    let vektetSum = 0, totalSp = 0;
    resultater.forEach((r) => {
        const verdi = GRADE_VAL[r.karakter];
        if (verdi !== undefined && r.studiepoeng) {
            vektetSum += verdi * r.studiepoeng;
            totalSp   += r.studiepoeng;
        }
    });

    const snitt = totalSp > 0 ? (vektetSum / totalSp).toFixed(2) : null;
    return { resultater, snitt, totalSp };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bokstavFraTall(n) {
    if (n >= 4.5) return 'A';
    if (n >= 3.5) return 'B';
    if (n >= 2.5) return 'C';
    if (n >= 1.5) return 'D';
    if (n >= 0.5) return 'E';
    return 'F';
}

function lagreState() {
    chrome.storage.local.set({
        utelatt:    Array.from(utelatt),
        overstyrte: overstyrteKarakterer,
    });
}

function beregnSnitt() {
    let vektetSum = 0, totalSp = 0;
    alleResultater.forEach((r) => {
        if (utelatt.has(r.emne)) return;
        const karakter = overstyrteKarakterer[r.emne] ?? r.karakter;
        const verdi    = GRADE_VAL[karakter];
        if (verdi !== undefined && r.studiepoeng) {
            vektetSum += verdi * r.studiepoeng;
            totalSp   += r.studiepoeng;
        }
    });
    return totalSp > 0 ? (vektetSum / totalSp).toFixed(2) : null;
}

// ─── Snitt-seksjon (alltid synlig, oppdateres live) ──────────────────────────

function oppdaterSnittseksjon() {
    const snitt = beregnSnitt();
    document.getElementById('avg-num').textContent = snitt ?? '—';

    const letterEl = document.getElementById('avg-letter');
    if (snitt) {
        const bokstav = bokstavFraTall(parseFloat(snitt));
        letterEl.textContent  = bokstav;
        letterEl.style.color  = GRADE_COLORS[bokstav] ?? '#555';
    } else {
        letterEl.textContent = '';
    }

    const aktive   = alleResultater.filter(r => !utelatt.has(r.emne));
    const beståttSp = aktive
        .filter(r => {
            const k = overstyrteKarakterer[r.emne] ?? r.karakter;
            return k !== 'F' && k !== 'Ikke bestått';
        })
        .reduce((s, r) => s + (r.studiepoeng || 0), 0);

    document.getElementById('avg-meta').textContent =
        `${beståttSp} studiepoeng · ${aktive.length} av ${alleResultater.length} emner`;
}

// ─── Oversikt-fane ───────────────────────────────────────────────────────────

function visOversikt() {
    // Karakterfordeling-bar
    const bar    = document.getElementById('grade-bar');
    const legend = document.getElementById('bar-legend');
    bar.innerHTML    = '';
    legend.innerHTML = '';

    const fordeling = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    const aktive    = alleResultater.filter(r => !utelatt.has(r.emne));
    aktive.forEach(r => {
        const k = overstyrteKarakterer[r.emne] ?? r.karakter;
        if (k in fordeling) fordeling[k]++;
    });

    const total = aktive.length;
    Object.entries(fordeling).forEach(([g, count]) => {
        if (count === 0) return;
        const seg = document.createElement('div');
        seg.className        = 'bar-seg';
        seg.style.flex       = count / total;
        seg.style.background = GRADE_COLORS[g];
        bar.appendChild(seg);

        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<div class="legend-dot" style="background:${GRADE_COLORS[g]}"></div>${g}: ${count}`;
        legend.appendChild(item);
    });

    // Emneliste
    const tabell = document.getElementById('tabell');
    tabell.innerHTML = '';
    alleResultater.forEach((r) => {
        const erUtelatt = utelatt.has(r.emne);
        const karakter  = overstyrteKarakterer[r.emne] ?? r.karakter;
        const gradClass = karakter in GRADE_COLORS ? `grade-${karakter}` : 'grade-other';

        const rad = document.createElement('div');
        rad.className = 'table-row' + (erUtelatt ? ' utelatt' : '');
        rad.innerHTML = `
            <span class="row-emne" title="${r.emne}">${r.emne}</span>
            <span class="row-karakter ${gradClass}">${karakter}</span>
            <span class="row-sp">${r.studiepoeng ?? '—'}</span>
        `;
        tabell.appendChild(rad);
    });
}

// ─── Rediger-fane ────────────────────────────────────────────────────────────

function visRedigering() {
    const liste = document.getElementById('edit-list');
    liste.innerHTML = '';

    alleResultater.forEach((r, i) => {
        const erUtelatt    = utelatt.has(r.emne);
        const gjeldendeKar = overstyrteKarakterer[r.emne] ?? r.karakter;
        const erEndret     = overstyrteKarakterer[r.emne] !== undefined;
        const id           = `emne-${i}`;

        const opsjoner = ALLE_KARAKTERER.map(k =>
            `<option value="${k}"${k === gjeldendeKar ? ' selected' : ''}>${k}</option>`
        ).join('');

        const rad = document.createElement('div');
        rad.className = 'edit-row' + (erUtelatt ? ' utelatt' : '');
        rad.innerHTML = `
            <input type="checkbox" id="${id}" ${erUtelatt ? '' : 'checked'}>
            <label for="${id}" class="edit-emne" title="${r.emne}">${r.emne}</label>
            <select class="edit-karakter${erEndret ? ' endret' : ''}">
                ${opsjoner}
            </select>
        `;

        // Toggle inkludering
        rad.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                utelatt.delete(r.emne);
                rad.classList.remove('utelatt');
            } else {
                utelatt.add(r.emne);
                rad.classList.add('utelatt');
            }
            lagreState();
            oppdaterSnittseksjon();
        });

        // Endre karakter
        rad.querySelector('select').addEventListener('change', (e) => {
            if (e.target.value === r.karakter) {
                delete overstyrteKarakterer[r.emne];
                e.target.classList.remove('endret');
            } else {
                overstyrteKarakterer[r.emne] = e.target.value;
                e.target.classList.add('endret');
            }
            lagreState();
            oppdaterSnittseksjon();
        });

        liste.appendChild(rad);
    });
}

// ─── Tab-navigasjon ──────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const fane = tab.dataset.tab;
        document.getElementById('fane-oversikt').style.display = fane === 'oversikt' ? '' : 'none';
        document.getElementById('fane-rediger').style.display  = fane === 'rediger'  ? '' : 'none';

        if (fane === 'oversikt') visOversikt();
        else                     visRedigering();
    });
});

// ─── Nullstill-knapp ─────────────────────────────────────────────────────────

document.getElementById('nullstill-btn').addEventListener('click', () => {
    utelatt.clear();
    overstyrteKarakterer = {};
    lagreState();
    visRedigering();
    oppdaterSnittseksjon();
});
