# Karakterkalkulator for StudentWeb

En nettleserutvidelse som automatisk beregner ditt vektede karaktersnitt direkte fra StudentWeb. Utviklet av en OsloMet-student, for studenter.

---

## Hva gjør den?

Utvidelsen leser karakterene dine fra resultat-siden i StudentWeb og regner ut det vektede snittet basert på studiepoeng — akkurat slik universitetet gjør det, men uten at du trenger å gjøre det manuelt.

- Beregner vektet snitt automatisk basert på studiepoeng
- Håndterer kontinuasjonseksamener riktig (beholder beste karakter)
- Viser full emneoversikt med karakter og studiepoeng
- Ignorerer emner med Bestått/Ikke bestått i snittet

---

## Installasjon

Utvidelsen er ikke publisert i Chrome Web Store ennå, så den må lastes inn manuelt. Dette tar ca. 2 minutter.

**Steg 1 — Last ned filene**

Klikk den grønne "Code"-knappen øverst på denne siden og velg "Download ZIP". Pakk ut zip-filen et sted du finner den igjen.

**Steg 2 — Åpne utvidelsessiden i nettleseren**

- Chrome: gå til `chrome://extensions`
- Arc: gå til `arc://extensions`
- Edge: gå til `edge://extensions`
- Brave: gå til `brave://extensions`
- Vivaldi gå til `vivaldi://extensions`

**Steg 3 — Skru på utviklermodus**

Øverst til høyre på siden finner du en bryter som heter "Utviklermodus" (eller "Developer mode"). Skru denne på.

**Steg 4 — Last inn utvidelsen**

Klikk "Last inn upakket" (eller "Load unpacked") og velg mappen du pakket ut i steg 1.

Utvidelsen er nå installert og vises som et blått K-ikon i verktøylinjen din.

---

## Bruk
1. Logg inn på StudentWeb på [student.oslomet.no](https://student.oslomet.no)
2. Naviger til **Resultater** i menyen
3. Klikk på det blå **K-ikonet** i nettleserens verktøylinje
4. Karaktersnittet ditt vises automatisk

---
Den norske karakterskalaen A–E konverteres til tallverdier:
| Karakter | Verdi |
|----------|-------|
| A |         5 |
| B |         4 |
| C |         3 |
| D |         2 |
| E |         1 |

Vektet snitt = sum(karakter × studiepoeng) / sum(studiepoeng)
Emner med karakteren F, Bestått eller Ikke bestått teller ikke med i snittet, men studiepoengene for beståtte emner telles med i totalen.
---

## Fungerer den for mitt universitet?
Utvidelsen er utviklet og testet på **OsloMet**. StudentWeb brukes av mange norske universiteter og høyskoler, men HTML-strukturen kan variere noe. Om utvidelsen ikke fungerer for deg, er du velkommen til å åpne et Issue her på GitHub med navnet på ditt lærested.
---

## Bidra
Fant du en feil, eller studerer du ved et annet universitet der den ikke fungerer? Åpne gjerne et Issue eller send en Pull Request. Jo flere som bidrar, jo flere studenter kan bruke den.
---

## Kontakt
Utviklet som et hobbyprosjekt. Har du spørsmål eller tilbakemeldinger, åpne et Issue på GitHub.
