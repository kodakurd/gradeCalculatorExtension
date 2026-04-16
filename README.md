# Karakterkalkulator for StudentWeb

En nettleserutvidelse som automatisk beregner ditt vektede karaktersnitt direkte fra StudentWeb. Laget av en OsloMet-student som ble lei av å gjøre det manuelt i Excel.
Med en enkel stack basert på DOM-manipulering gjennom JavaScript, HTML og CSS, gjør urvidelsen akkurat det den skal samtidig som brukergrensesnittet er pent og enkelt.

---

## Hva gjør den?

Utvidelsen leser karakterene dine fra resultat-siden i StudentWeb og regner ut det vektede snittet basert på studiepoeng — akkurat slik universitetet gjør det.

- Beregner vektet snitt automatisk basert på studiepoeng
- Henter både interne resultater og eksterne resultater fra andre universiteter
- Håndterer kontinuasjonseksamener riktig (beholder beste karakter)
- Viser full emneoversikt med karakter og studiepoeng
- Emner med Bestått/Ikke bestått teller ikke med i snittet
- **Rediger-fane:** ekskluder emner du ikke vil ha med, eller endre en karakter for å se hva snittet ditt hadde blitt

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
- Vivaldi: gå til `vivaldi://extensions`

**Steg 3 — Skru på utviklermodus**

Øverst til høyre på siden finner du en bryter som heter "Utviklermodus" (eller "Developer mode"). Skru denne på.

**Steg 4 — Last inn utvidelsen**

Klikk "Last inn upakket" (eller "Load unpacked") og velg mappen du pakket ut i steg 1.

Utvidelsen er nå installert og vises som et blått K-ikon i verktøylinjen din.

---

## Bruk

1. Logg inn på StudentWeb på [fsweb.no/studentweb](https://fsweb.no/studentweb) eller via ditt universitets portal
2. Naviger til **Resultater** i menyen
3. Klikk på det blå **K-ikonet** i nettleserens verktøylinje, eller gjennom **Extensions** / **Utvidelser**.
4. Karaktersnittet ditt vises automatisk

Vil du justere hva som regnes med? Gå til **Rediger**-fanen for å ekskludere enkeltfag eller endre en karakter.

---

## Hvordan beregnes snittet?

Karakterskalaen A–E konverteres til tallverdier: A=5, B=4, C=3, D=2, E=1.

Snittet regnes ut som:

```
sum(karakter × studiepoeng) / sum(studiepoeng)
```

Emner med F, Bestått eller Ikke bestått teller ikke med i snittet, men studiepoengene for beståtte emner telles med i totalen.

---

## Fungerer den for mitt universitet?

Ja — utvidelsen er bygget for å fungere med alle norske universiteter og høyskoler som bruker StudentWeb (FS). Den henter både resultater fra din nåværende institusjon og eventuelle eksterne resultater fra andre steder du har studert.

Den er utviklet og testet på OsloMet og UIO, men siden alle FS-institusjoner bruker samme HTML-struktur skal den fungere uansett hvor du studerer. Hvis den likevel ikke fungerer for deg, er du velkommen til å åpne et Issue her på GitHub med navnet på ditt lærested.

---

## Bidra

Fant du en feil, eller studerer du ved et annet universitet der den ikke fungerer? Åpne gjerne et Issue eller send en Pull Request. Jo flere som bidrar, jo flere studenter kan bruke den.

---

## Kontakt

Laget som et hobbyprosjekt da jeg selv ønsker å ha oversikt over mitt karaktersnitt, det er brukt AI for hjelp under utvikling av prosjektet. Har du spørsmål eller tilbakemeldinger, åpne et Issue på GitHub.
