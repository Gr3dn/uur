# Interaktivni dispecer tramvajove dopravy

Autor: Hrechishkin  
Osobni cislo: A23B0394P

## Ucel aplikace
Tato aplikace je semestralni projekt zamereny na netrivialni GUI. Simuluje praci jednoducheho tramvajoveho dispecera, ktery:

- vybere linku a smer ve stromove navigaci,
- upravuje spoje v editovatelne tabulce,
- sleduje stav tramvaji ve vlastni vykreslovane mape,
- uklada a nacita rozpracovany stav z `LocalStorage`.

Projekt je zamerne postaven jako studentska desktop-like web aplikace s mock daty a bez backendu. Cilem neni hotovy provozni system, ale kvalitni demonstrace GUI, validace vstupu a synchronizace vice pohledu nad jednou datovou sadou.

## Hlavni workflow
Zakladni workflow aplikace je:

1. Uzivatel vybere linku nebo smer v `Tree View`.
2. Tabulka `Data Grid` se automaticky prefiltruje na vybranou trasu.
3. Uzivatel muze pridat, upravit nebo smazat spoj.
4. Zmena stavu nebo zpozdeni se okamzite projevi na mape.
5. V rezimu `Live monitoring` lze spustit simulovany cas a sledovat pohyb tramvaji po trase.
6. Stav je mozne ulozit a pozdeji obnovit.

## Pouzite technologie
- React + TypeScript
- MUI
- MUI X Data Grid
- MUI X Tree View
- vlastni CSS soubory
- `i18next` pro EN/CS prepinani
- `LocalStorage` pro ukladani stavu

## Spusteni projektu
```bash
npm install
npm run dev
```

Produkci build:
```bash
npm run build
```

Kontrola kodu:
```bash
npm run lint
```

## Struktura reseni
- `src/components/RouteTree.tsx` - hierarchicka navigace linek, smeru a zastavek
- `src/components/ScheduleGrid.tsx` - editovatelna tabulka spoju s validaci
- `src/components/TimelineMap.tsx` - vlastni vykreslovana mapa trasy s pohybem tramvaji
- `src/store/TransitStoreContext.tsx` - centralni store a observer-like synchronizace UI
- `src/store/transitReducer.ts` - logika zmen stavu
- `src/data/mockData.ts` - mock data pro dve linky
- `src/store/storage.ts` - ukladani a nacteni stavu
- `src/i18n/resources.ts` - preklady
- `src/styles/*.css` - oddelene styly aplikace

## Splnene body zadani
- netrivialni GUI s jednim ucelenym pracovnim celkem
- `Data Grid`
- `Tree View`
- vlastni vykreslovana komponenta mapy
- vice pohledu nad jednou datovou sadou
- hierarchicka navigace
- dva rezimy prace: planovani a live monitoring
- prubezna zpetna vazba pres barevne stavy, alerty, snackbary a animaci nehody
- ulozeni stavu
- validace vstupu
- responzivni layout
- vicejazycnost

## Poznamka k rozsahu
Data jsou mockovana a ulozena jen lokalne. To je v souladu se zadanim, ktere nevyzaduje databazi ani server. Dulezitejsi casti projektu jsou navrh GUI, synchronizace komponent a obhajitelna struktura kodu.

## Dokumentace ke kriteriim
Podrobna mapa splnenych kriterii, odkazy do kodu a self-evaluation jsou v souboru `docs/criteria-map.md`.
