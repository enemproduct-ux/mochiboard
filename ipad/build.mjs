// Produces an iPad website without editing any files used by the desktop apps.
import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'build/ipad');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, 'web'), out, { recursive: true });
for (const file of ['ipad.css', 'ipad.js', 'manifest.webmanifest', 'icon.svg']) {
  await cp(path.join(root, 'ipad', file), path.join(out, file));
}
let html = await readFile(path.join(out, 'index.html'), 'utf8');
html = html.replace('width=device-width, initial-scale=1', 'width=device-width, initial-scale=1, viewport-fit=cover');
html = html.replace('</head>', `<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#fbf8fc">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="My planning board">
<link rel="apple-touch-icon" href="touch-icon.png">
<link rel="stylesheet" href="ipad.css">
</head>`);
// Runs before app.js starts so browser demo behavior is never used for AI.
html = html.replace('<script src="app.js"></script>', '<script src="ipad.js"></script>\n<script src="app.js"></script>');
await writeFile(path.join(out, 'index.html'), html);
let app = await readFile(path.join(out, 'app.js'), 'utf8');
const breakpoint = "matchMedia('(max-width: 700px)')";
if (!app.includes(breakpoint)) throw new Error('Upstream tablet layout hook changed; review the iPad build.');
app = app.replace(breakpoint, "matchMedia('(max-width: 1100px)')");
await writeFile(path.join(out, 'app.js'), app);
// Use the generic original icon generated from our SVG, not the desktop app icon.
await cp(path.join(root, 'ipad/touch-icon.png'), path.join(out, 'touch-icon.png'));
let sw = await readFile(path.join(out, 'sw.js'), 'utf8');
const digest = createHash('sha256').update(html + app + await readFile(path.join(out, 'ipad.js')) + await readFile(path.join(out, 'ipad.css'))).digest('hex').slice(0, 12);
sw = sw.replace(/const CACHE = '[^']+';/, `const CACHE = 'ipad-planning-${digest}';`)
  .replace("const FILES = [", "const FILES = ['ipad.css', 'ipad.js', 'manifest.webmanifest', 'icon.svg', 'touch-icon.png',")
  .replace('k !== CACHE', "k.startsWith('ipad-planning-') && k !== CACHE")
  .replace("r || caches.match('index.html')", "r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())");
await writeFile(path.join(out, 'sw.js'), sw);
console.log('Built build/ipad; desktop sources unchanged.');
