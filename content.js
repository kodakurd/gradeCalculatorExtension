
//script for retrieving content and calculating avg

// karakterskalaen og tallverdier for A til E
const GRADE_VAL = {A: 5, B: 4, C: 3, D: 2, E: 1};

//funksjon som henter alle emner, karakterer og studiepoeng fra StudentWeb-portalen og resultat siden
function hentKarakterer() {
    const rader = document.querySelectorAll("tr.resultatTop, tr.none");
    const resultater = [];

    rader.forEach(rad => {
        //hente emnenavnet fra col2Emne
        const infoLinjer = rad.querySelectorAll("td.col2Emne div.infoLinje");
        const emne = infoLinjer.length > 0
            ? infoLinjer[infoLinjer.length - 1].innerText.trim()  // siste infoLinje = emnenavn
            : rad.querySelector("td.col2Emne")?.innerText.trim().split("\n").filter(l => l.trim().length > 0)[0]?.trim();

        //hente karakteren fra span i col6Resultat
        const karakter = rad.querySelector("td.col6Resultat div.infoLinje span")?.innerText.trim();

        //hente studiepoeng fra span i col7Studiepoeng, bytter komma med punktum for utregning
        const studiepoeng_tekst = rad.querySelector("td.col7Studiepoeng span")?.innerText.trim();
        const studiepoeng = parseFloat(studiepoeng_tekst?.replace(",", "."));

        //legger kun til denne raden med "resultat" dersom vi finner emnenavn og karakter
        if(emne && karakter){
            const eksisterende = resultater.findIndex(r => r.emne === emne);
            if (eksisterende !== -1) {
                const gammelVerdi = GRADE_VAL[resultater[eksisterende].karakter] ?? 0;
                const nyVerdi = GRADE_VAL[karakter] ?? 0;
                if (nyVerdi > gammelVerdi) {
                    resultater[eksisterende] = { emne, karakter, studiepoeng };
                }
            } else {
                resultater.push({ emne, karakter, studiepoeng });
            }
        }
    });

    return resultater;
}

//funksjon som regner ut karakter-vekt basert på studiepoeng
//sum(karakter * studiepoeng) / sum(studiepoeng)
function regnUtSnitt(resultater) {
    let vektetSum = 0;
    let totaleStudiepoeng = 0;

    resultater.forEach(r => {
        const verdi = GRADE_VAL[r.karakter];

        //ikke bruk emner uten tallkarakter, altså udefinert karakter
        if (verdi !== undefined && r.studiepoeng){
            vektetSum += verdi * r.studiepoeng;
            totaleStudiepoeng += r.studiepoeng;
        }
    });

    //returnerer snittet med to desimaler, eller null hvis ingen gyldige emner
    return totaleStudiepoeng > 0? (vektetSum/totaleStudiepoeng).toFixed(2) : null;
}

//kjører funksjoner og skriver resultatet til konsollen
const data = hentKarakterer()
const snitt = regnUtSnitt(data)

console.log("Emner funnet: ", data)
console.log("Vektet snitt er: ", snitt)
