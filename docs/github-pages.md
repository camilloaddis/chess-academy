# Pubblicazione su GitHub Pages

Il workflow verifica unit test, build, manifest, artefatti e test browser (anche offline), quindi pubblica **solo `dist/`** dopo ogni push su `main`. Le PR eseguono le verifiche senza deploy. Node 22 e `npm ci` usano il lockfile.

## Impostazioni manuali

1. In Settings → Pages scegliere **Source: GitHub Actions**.
2. Consentire GitHub Actions e le azioni ufficiali usate dal workflow; consentire il deploy nell'ambiente `github-pages` dal branch `main` (approvare eventuali protection rules).
3. URL previsto: https://camilloaddis.github.io/chess-academy/ . Non impostare un dominio personalizzato senza aggiornare base, manifest e test.
4. La repository è privata: GitHub Pages su GitHub Free richiede una repository pubblica; mantenerla privata richiede un piano che supporti Pages per repository private. **Non renderla pubblica nello stato attuale:** il PDF originale è tracciato anche nella cronologia Git. Prima di cambiare visibilità occorre rimuovere il materiale protetto da tutta la cronologia oppure creare una nuova repository pubblica con soli file autorizzati. Questa PR non cambia visibilità e non riscrive la cronologia.

## URL e PWA

`base`, identità, start URL e scope sono `/chess-academy/`. Le route restano hash (`#/path`, `#/lesson/board`): il refresh richiede sempre il documento `/chess-academy/`, compatibile con Pages senza redirect 404. I percorsi senza hash non sono route dell'app.

Il primo accesso deve essere online fino all'attivazione del service worker; successivamente lezioni e navigazione funzionano offline. Gli aggiornamenti usano il ciclo di attesa del service worker e diventano attivi dopo la chiusura delle schede precedenti. Non cancellare i dati del sito per aggiornare.

IndexedDB mantiene nome `chess-academy`, versione 1, store `state` e chiave `progress`. La pulizia delle cache Workbox non cancella IndexedDB. I progressi appartengono all'origine, non al percorso: quelli su localhost o un altro dominio non vengono trasferiti automaticamente a github.io. Cancellazione dei dati browser o espulsione dello storage può comunque eliminarli.

## Artefatti e materiale di riferimento

La build prepara una directory pubblica temporanea copiando esclusivamente le tre icone esistenti. Non copia `source/`, PDF, documentazione o altri file arbitrari da `public/`. Un controllo finale blocca file fuori allowlist, firme PDF e riferimenti al documento sorgente. Solo `dist/` viene caricato come artefatto Pages.

Testi e design didattici restano invariati. Le note esistenti descrivono testi rielaborati e un diagramma ricostruito dalla fonte: i controlli tecnici escludono i documenti originali, ma non attestano i diritti sui contenuti didattici. Qualsiasi ulteriore esclusione di tali contenuti richiede una revisione editoriale e dei diritti prima della pubblicazione.

## Verifica locale

```sh
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

I test usano il percorso reale `/chess-academy/`, verificano navigazione e refresh, scope e icone, uso offline e conservazione dei progressi dopo l'attivazione di un service worker aggiornato. Per Chromium già installato impostare `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
