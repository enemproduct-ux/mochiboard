# iPad web version

Develop this version on `ipad-web`. Keep the Mac app on `main`.
Everything specific to iPad lives in this directory. The build copies `web/`
into ignored `build/ipad/`, then adds installation metadata, tablet styling,
a wider breakpoint for the existing touch layout, and iPad-only behavior.
It never modifies `web/`, `Sources/`, or the desktop installers.

## Build

With Node.js 20 or newer, from the repository root:

```sh
node ipad/build.mjs
```

Serve **only `build/ipad/`** on an HTTPS static host. Relative paths support
hosting beneath a subdirectory. Open that URL in iPad Safari and choose
Share → Add to Home Screen. After the first successful online load,
the service worker caches the canvas for offline use.

## Current scope

- Existing note, checklist, image, wireframe and drawing tools.
- Existing pan, pinch, hold menus, and Pointer Events drawing, including Pencil
  input. Pressure sensitivity, Scribble and palm rejection are not added.
- Browser-local boards; no Mac sync. Safari and installed apps may use separate
  storage. Clearing site data removes local boards.
- Settings → General contains installation help and JSON board backup download.
  Video attachments are not in this backup. Backup import is not implemented yet.
- AI is explicitly disconnected instead of returning browser demo responses.
  Mac-only exports, transcription and helper integrations remain unavailable.
- Offline caching covers the app and bundled assets; remote images and
  services may require internet.

The first version needs hands-on iPad Safari testing before relying on it for
important boards. Keep backups. No changes are merged into `main`.

## Distribution

This is a personal fork. The original code license is in `../LICENSE` and the
brand/art terms are in `../TRADEMARKS.md`. Before sharing a derivative publicly,
replace the original name, character, art and music as described there.
