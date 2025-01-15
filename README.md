---
title: Magisterium
subtitle: Skupina 14 | Aliženirja
author:
- Miha Meglič <mm4471@student.uni-lj.si>
- Jošt Eržen <je6506@student.uni-lj.si>
lang: sl
numbersections: true
---

> Projektna naloga za Računalniške storitve v oblaku (UL FRI)

# Informacije o projektu

GitHub organizacija: <https://github.com/rso-magisterium/>

Aplikacija: <https://magisterium.works/>

Račun za prijavo:

- e-mail: <test@example.com>
- geslo: tester1234

Povzetek tehnologij:

- Oblačna infrastruktura: Azure
- Orkestracija: Kubernetes (AKS), Docker / Docker Compose, Helm, Helmfile, GitHub Actions
- Čelni del: Nuxt.js, Axios, Tailwind CSS
- Zaledni del: Node.js, TypeScript, REST, GraphQL, gRPC
- Podatkovna baza: PostgreSQL
- Razvojno okolje: VisualStudio Code, IntelliJ Idea, DBeaver, Insomnia/Postman

# Opis projekta

Razvila sva spletno platformo namenjeno za vzgojno-izobraževalne inštitucije - **Magisterium**.

Motivacija za projekt so bile slabe izkušnje z podobnimi platformami, kot npr. Moodle ter eAsistent.
Najin projekt ponuja alternativo tema velikanoma vzgojno-izobraževalnih informacijski sistemov ter združuje njuno funkcionalnost v eno celoto.
Obenem pa ponuja preprosto in cenovno učinkovito skaliranje glede na potrebe uporabnikov.

V trenutnem stanju najina platforma podpira nekaj vzgojno-izobraževalnih aktivnosti, kot so komunikacija z uporabniki, urnik, spletna učilnica ter forum.

# Orodja in razvojno okolje

Za čelni del sva se odločila za uporabo razvojnih okolij IntelliJ Idea Ultimate ter VisualStudio Code.
Za testiranje API klicev sva uporabila odprtokodno orodje Insomnia.

Čelni del je napisan v ogrodju Nuxt, za poganjanje uporabniškega vmesnika pa sva uporabila okolje Node.js.
Za olepšavo aplikacije sva uporabila Tailwind CSS, za izvajanje API klicev pa Axios.

Zaledni del pa je napisan v TypeScript, ki se prevede v JavaScript in prav tako izvede na podlagi Node.js.
Posamezne storitve uporabniku izpostavljajo REST API, ki je dokumentiran s pomočjo orodij OpenAPI, za medsebojno komunikacijo pa uporabljajo GraphQL, gRPC in pa isti REST API, ki je izpostavljen uporabnikom.
Vse storitve za hrambo podatkov uporabljajo neodvisne instance PostgreSQL, s katerimi komunicirajo s pomočjo Prisma ORM, ki olajšuje vzdrževanje sheme in dostop do podatkov.

Med zalednimi storitvami je tudi manjša storitev, ki združuje OpenAPI dokumentacije, ki jih izpostavljajo ostale storitve in jih v berljivem in uporabnem formatu poda uporabniku (in razvijalcem).

Pri razvoju sva si pomagala z uporabo Docker in Docker Compose, da sva lahko na preprost način poganjala vse člene aplikacije. Prav tako sva implementirala dele CI/CD, ki so avtomatsko testirali napisano kodo in pripravili zbirnike za postavitev v testnem in produkcijskem Kubernetes okolju.

# Shema arhitekture

![Shema arhitekture](docs/resources/Architecture_final.png)

\pagebreak

# Seznam funkcionalnosti mikrostoritev

## Uporabniki (*Users*)

Storitev upravlja z identitetami akterjev, ki so deljene po najemnikih (*angl. tenant*).
Za vsakega uporabnika hrani ime, e-poštni naslov, geslo, zunanje ponudnike avtentikacije in razne interne atribute kot "Super Admin".
Implementira tudi avtentikacijo z e-poštnim naslovom in geslom ter OAuth2 preko ponudnika GitHub.

Povzetek API klicev:

- */api/auth/* - Klici namenjeni prijavi, odjavi ter registraciji uporabnika
- */api/tenant* - Klici za upravljanje najenmikov
- */api/user/* - Klici namenjeni za pridobivanje podatkov o uporabniku

## Predmet (*Classroom*)

Storitev upravlja s predmeti, ki se poučujejo.
Beleži nosilca/e predmeta, udeležence, vsebino spletne strani ter forum za javno komunikacijo med udeleženci predmeta.

Poleg tega izpostavlja klic, kjer nosilci predmeta lahko vpisujejo v urnik za dan predmet.

Povzeti API klici:

- */api/classroom/* - Klici za pridobitev ter posodabljanje podatkov z učilnice in upravljanje z urnikom predmeta
- */api/classrooms/* - Klic za pridobitev vseh predmetov, ki jih prijavljen uporabnik obisuje

## Urnik (*Schedule*)

Storitev upravlja z urniki predmetov in podpira dodajanje enkratnih ali ponavljajočih se dogodkov.

Povzeti API klici:

- */api/schedule/* - Klici za pridobitev uporabnikovega urnika

## Komunikacija (*Messaging*)

Skrbi za pošiljanje in dostavo sporočil med udeleženci.

- */api/contacts/* - Klici za pridobitev kontaktnih podatkov uporabnikov znotraj istega najemnika
- */api/message/* - Klici za pošiljanje ter prejemanje sporočil

## API dokumentacija (*API Frontend*)

Že prej omenjena storitev, ki združuje dokumentacije ostalih storitev v enoten, uporabniku prijazen vmesnik, ki je dosegljiv na */api/docs*.
Prav tako pa izpostavlja surovo obliko dokumentacije, ki je predvsem uporabna razvijalcem, ki bi želeli uporabljati API. Ta je dosegljiva na */api/openapi.json*.

# Primeri uporabe

- **Sporočanje**: Omogoča preprosto komunikacijo med izvajalci in učenci.
- **Urnik**: Najemnik lahko vnese urnik, kjer si učenci in učitelji lahko ogledajo prihajajoče obveznosti.
- **Spletna učilnica**: Profesor lahko objavi učno gradivo za svoje učence.
- **Forum**: Omogoča odprto komunikacijo vseh udeležencev danega predmeta.

Bolj kompleksen primer uporabe bi bila komunikacija z učiteljem. Uporabnik se mora najprej prijaviti, kjer sodeluje uporabniška mikrostoritev. Nato uporabnika preusmeri na domačo stran, kjer mikrostoritev za urnike naloži urnik. Sledi navigacija na stran klepeta, kjer komunikacijska mikrostoritev naloži kontakte ter sporočila, na koncu pa še pošlje uporabnikovo sporočilo.

Najina storitev je primerna za raznovrste izobraževalne ustanove, saj lahko zaradi lahke skalabilnosti hitro in avtonomno razporeja vire naše aplikacije. Prav tako znižamo stroške šoli, saj ponujamo visoko razpoložljivost v primerih ko je sistem obremenjen kot na primer pred izpitnim obdobjem.

# Seznam projektnih zahtev

- (obvezno) Repozitoriji, ki sledijo strukturi GIT Flow
- (obvezno) Mikrostoritve in "cloud-native" aplikacija
- (obvezno) Dokumentacija projekta
- Dokumentacija API (Swagger in OpenAPI) dostopna na */api/docs*
- CI/CD za gradnjo in testiranje (namestitev na gručo je delno avtomatska)
- Helm charts v repozitoriju <https://rso-magisterium.github.io/helm-charts/>, ki so uporabljene za postavitev s pomočjo Helmfile
- (obvezno) Namestitev v oblak - Azure
- Večnajemništvo
- Preverjanje zdravja na vseh zalednih storitvah in podatkovnih bazah
- GraphQL in gRPC komunikacija med storitvami
- Centralizirano beleženje dnevnikov z Azure Monitor
- Zbiranje metrik z Azure upravljano instanco Prometheus (ni implementacije v storitvah)
- (obvezno) Grafični vmesnik
- (obvezno) Oddaja projekta

Dodatne točke:

- Terraform za postavitev AKS
- Ingress Controller (Traefik)
- OAuth2 / OIDC avtentikacija z GitHub
