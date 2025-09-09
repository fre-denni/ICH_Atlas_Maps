# ICH-ATLAS Visualisations

A github repo containing all the resources and scripts for the visualisations visible at: [ich-atlas.com](https://tramadev.nextatlas.com/)

```
.
├── 404.html
├── about.html
├── assets
│   ├── favicon-96x96.png
│   ├── favicon.ico
│   ├── favicon.svg
│   └── Logo.svg
├── data
│   └── links.csv
├── index.html
├── lib
│   ├── d3-bboxCollide.min.js
│   └── d3.js
├── README.md
├── scripts
│   ├── createComparisonsTool.js
│   ├── createCompetencesMap.js
│   ├── createCreativeMap.js
│   ├── createDigitalisationMap.js
│   ├── fetchData.py
│   ├── menu.js
│   └── modal.js
├── style.css
└── visualisations
    ├── comparisons-tool.html
    ├── competences-map.html
    ├── creative-approaches.html
    └── digitalisation-flux.html
```

---

This external website to the project contains all the results and visualisation of the Quality Research conducted by the Trama Research Group of [Politecnico di Milano](https://dipartimentodesign.polimi.it/it) regarding the mapping of design and heritage projects on [intangible cultural heritage](https://ich.unesco.org/en/what-is-intangible-heritage-00003).

The objective of this mapping is to define for Cultural Creative Industries, Educators, Policy Makers and Heritage Institutions best practices to follow and establish directive, so to support the industry and valorisation processes of intangible heritage.

---

This project is a collaboration between [iCoolHunt](https://www.nextatlas.com/) and Politecnico di Milano.

Research and mapping done by Chiara Di Lodovico, Federica Rubino, Davide Spallazzo

Coding and Design of Data Visualisation done by Chiara di Lodovico and [Federico Denni](https://federicodenni.com/)

Made with best intentions and open-source code :heart:

---

### Operativo

#### Fase 1

- [x] Finire impostazione sito

  - [x] Importare CSS globale e applicare alle pagine
  - [x] Fare menu e link da index.html
    - [x] Impostare UI per navigazione sito
    - [x] Importa icone e favicon
  - [x] Fare script di base per visualizzazioni
    - [x] importare d3.js nelle pagine
    - [x] importare data
  - [ ] Vedi alternative di hosting -- coordinarsi con icoolhunt
    - [x] Vedi come nascondere parti della Ui per l'`<i-frame>`

  #### Fase 2

- [ ] Connect and host the cleaned data
- [ ] Comparison Tool
  - [ ] Migliorare etichette e UI (leggibilità e lettura)
  - [ ] Impostare gerarchia visiva differente
  - [ ] Impostazione preliminare e visiva dei data (pre-cleaning)
- [ ] Creative Map
  - [ ] Capire come visualizzare (sketch e prove di viz)
  - [ ] Impostazione sheet, excel, data e lettura
  - [ ] Impostazione preliminare e visiva dei data
- [ ] Competences Map
  - [ ] Impostazione base (importare e pulire sheet)
  - [ ] Impostazione preliminare e visiva dei data
- [ ] Digitalisation Map
  - [ ] Impostazione base (fake dataset)
  - [ ] Impostazione preliminare e visiva dei data

### Fase 3

- [ ] Connettere e visualizzare le visualizzazioni
  - [ ] Comparison Tool
  - [ ] Creative Map
  - [ ] Competences Map
  - [ ] Digitalisation Map
- [ ] Finire menu di navigazione
  - [ ] impostare modale search e codice (lunr.js)
    - [ ] zooming su nodi id
    - [ ] modale data quando cliccati
  - [ ] impostare modale "more" e linking
  - [ ] label dinamiche per funzionalità bottone (animazione e titoli)
