# Mapa kriterii a self-evaluation

Autor: Hrechishkin  
Osobni cislo: A23B0394P

## 1. Smysl aplikace
Aplikace predstavuje jednoduche pracoviste tramvajoveho dispecera. Neni to genericky "klient k databazi", ale konkretni nastroj pro:

- vyber linky a smeru,
- upravu spoju,
- sledovani stavu tramvaji,
- simulaci provozu v case,
- ulozeni rozpracovane prace.

Pridanou hodnotou je to, ze jedna data lze sledovat a menit ve trech ruznych reprezentacich: strom, tabulka, vlastni mapa.

## 2. Kde jsou splnena hlavni GUI kriteria

### Netrivialni struktura GUI
- Hlavni workflow aplikace je definovano v `src/App.tsx`.
- Desktop layout a mobilni drawer jsou v `src/styles/layout.css` a `src/components/AppHeader.tsx`.
- Aplikace ma jasny cil: trasy -> spoje -> live monitoring -> ulozeni stavu.

### Data Grid
- `src/components/ScheduleGrid.tsx`
- Tabulka neni jen pro zobrazeni, ale i prijima vstup.
- Uzivatel muze pridavat, upravovat a mazat spoje.
- Pouzite jsou ruzne typy bunek: `singleSelect`, `number`, text, action cells.

### Tree View
- `src/components/RouteTree.tsx`
- Strom obsahuje linky, smery a zastavky.
- Klik na strom meni stav cele aplikace.
- Strom tedy neni izolovany widget, ale navigacni vrstva nad daty.

### Vlastni vykreslovana komponenta
- `src/components/TimelineMap.tsx`
- `src/styles/timeline.css`
- Trasa se kresli jako SVG polyline, zastavky jako vlastni body a tramvaje jako dynamicke markery.
- Stav nehody je vizualizovan animaci.

## 3. Kriteria komplexnosti GUI
Aplikace splnuje vice nez tri pozadovana kriteria:

### Vice funkcnich pohledu nad jednou datovou sadou
- stromova reprezentace: `src/components/RouteTree.tsx`
- tabulkova reprezentace: `src/components/ScheduleGrid.tsx`
- vizualni reprezentace: `src/components/TimelineMap.tsx`

### Hierarchicka navigace
- `Tree View` obsahuje linka -> smer -> zastavka
- implementace: `src/components/RouteTree.tsx`

### Vicekrokovy workflow
- vyber trasy -> uprava dat -> live sledovani -> save/load
- hlavni orchestraci workflow dela `src/App.tsx`

### Kontextove zavisle ovladani
- rezim `planning` vs `live`
- v `planning` je hlavni editace tabulky
- v `live` se spousti simulovany cas a vizualni monitoring na mape
- logika: `src/store/transitReducer.ts`, `src/components/TimelineMap.tsx`

### Reakce na zmeny v case
- simulovany cas bezi v intervalu po jedne sekunde
- implementace: `src/store/TransitStoreContext.tsx`
- vizualizace casu a pohybu: `src/components/TimelineMap.tsx`

### Prubezna zpetna vazba
- `Snackbar` po save/load/reset: `src/App.tsx`
- `Alert` pri validacni chybe: `src/components/ScheduleGrid.tsx`
- barevne odliseni stavu radku: `src/styles/grid.css`
- animace nehody na mape: `src/styles/timeline.css`

## 4. Validace, binding a observer-like chovani

### Kontrola vstupu
- `src/store/TransitStoreContext.tsx`
- `src/utils/time.ts`
- validuji se:
  - format casu,
  - prijezd po odjezdu,
  - spravny smer k lince,
  - spravna tramvaj k lince.

### Observer / synchronizace vice pohledu
- centralni store: `src/store/TransitStoreContext.tsx`
- reducer: `src/store/transitReducer.ts`
- selektory: `src/store/transitSelectors.ts`
- zmena v tabulce se bez reloadu projevi ve stavu mapy a filtrovani ostatnich komponent.

### Lambda vyrazy
- V projektu jsou bezne pouzite arrow functions jako obsluhy udalosti, callbacky a transformace dat.
- Priklady:
  - `src/components/ScheduleGrid.tsx`
  - `src/components/RouteTree.tsx`
  - `src/components/AppHeader.tsx`

## 5. Dalsi body

### Ukladani stavu
- `src/store/storage.ts`
- explicitni akce save/load/reset v headeru

### Vicejazycnost
- `src/i18n/index.ts`
- `src/i18n/resources.ts`
- vychozi jazyk je cestina, ale aplikace umi i anglictinu

### CSS v oddelenych souborech
- `src/styles/global.css`
- `src/styles/layout.css`
- `src/styles/tree.css`
- `src/styles/grid.css`
- `src/styles/timeline.css`

### Responzivita
- desktop: fixni levy panel + dve hlavni pracovni oblasti
- uzsi sirka: strom se skryje do draweru
- implementace: `src/App.tsx`, `src/components/AppHeader.tsx`, `src/styles/layout.css`

## 6. Self-evaluation a aspirace na body
Nasledujici hodnoceni je orientacni a vychazi z toho, co aplikace realne umi.

### Silne stranky
- Zadani je smysluplne a ma jasny pracovnici scenar.
- GUI ma tri realne propojene reprezentace dat.
- Tabulka je editovatelna a obsahuje validaci.
- Mapa je vlastni vykreslovana komponenta, neni to jen hotovy chart.
- Aplikace ma save/load, i18n, responzivitu a centralni state management.

### Slabsi stranky
- Backend neni implementovan.
- Data jsou mockovana.
- Jde primarne o demonstracni aplikaci, ne o plny produkt.

### Realisticka aspirace
- Smysluplnost zadani: vysoka
- Komplexnost aplikace: stredni az vyssi
- Kvalita designu: stredni az vyssi
- Fungovani aplikace: stredni
- Komplexni GUI: vysoka
- User experience: stredni az vyssi
- Kontrola vstupu: vysoka
- Vyuzi tabulky, stromu a vlastni vykreslovane komponenty: vysoka
- CSS, i18n, persistence a observer-like synchronizace: splneno

Podle meho nazoru aplikace obhajitelne miri nad minimalni hranici a mela by mit potencial na solidni bodove hodnoceni, pokud bude dobre prezentovana.
