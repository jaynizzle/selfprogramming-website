# Chat Builder für GitHub Pages

Dieses Projekt ist die Website-Seite deines Pilots.

## Idee

- `builder.html` ist der Chat-Builder.
- `index.html` ist die veröffentlichte Website.
- Der Builder kann die generierte Website als `index.html` in dein GitHub-Repo schreiben.
- Dafür braucht er die separate GitHub Writer API.

## Dateien

```text
index.html      Platzhalter für die veröffentlichte Website
builder.html    Chat-Builder
config.js       URL zur GitHub Writer API
style.css       Builder-Design
app.js          Builder-Logik
README.md
```

## GitHub Pages

Lade diese Dateien in dein Website-Repository.

Danach GitHub Pages aktivieren:

```text
Settings
→ Pages
→ Source: Deploy from a branch
→ Branch: main
→ Folder: / root
→ Save
```

Dann öffnet `/` die veröffentlichte Website.

Der Builder liegt hier:

```text
https://DEINNAME.github.io/DEIN-REPO/builder.html
```

## GitHub Writer API verbinden

Wenn du die API bei Vercel deployed hast, bekommst du eine URL wie:

```text
https://github-writer-api-deinname.vercel.app/api/update-index
```

Diese URL trägst du in `config.js` ein:

```js
window.BUILDER_CONFIG = {
  publishApiUrl: "https://github-writer-api-deinname.vercel.app/api/update-index"
};
```

Danach `config.js` committen.

## Nutzung

1. Öffne `builder.html`.
2. Schreibe z. B.:

```text
Mach eine Landingpage für ein KI-Automationsstudio
```

3. Klicke auf `Auf main speichern`.
4. Gib dein `ADMIN_SECRET` ein.
5. Die API überschreibt `index.html` im `main` Branch.
6. GitHub Pages deployed neu.

## Wichtig

Das ist ein Pilot. Er schreibt direkt auf `main`.

Für später wäre sicherer:

```text
Chat → Branch → Pull Request → Preview → Merge
```
