// iPad-only additions. Do not import this into the desktop app.
(() => {
  const unavailable = () => Promise.reject(new Error('AI is not connected in this iPad version. Your canvas works offline.'));
  Object.assign(window.MB, { ask: unavailable, rewrite: unavailable });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.web-note').forEach(el => {
      el.textContent = 'Your boards are saved on this iPad in this browser or Home Screen app. AI and the Mac helpers are not connected.';
    });
    const host = document.querySelector('.settings .set-body') || document.querySelector('.set-body');
    const about = document.createElement('section');
    about.className = 'ipad-info';
    about.dataset.tab = 'general';
    about.innerHTML = `<h3>Your iPad board</h3>
      <p>In Safari, tap Share → Add to Home Screen, then open the new icon.</p>
      <p>Drag empty space to pan. Pinch with two fingers to zoom. Hold a card for its menu. Choose the drawing tool to draw with your finger or Apple Pencil.</p>
      <p>Boards stay on this device. Safari and the Home Screen app can have separate storage: choose one place to work. Clearing website data can erase boards.</p>
      <p class="ipad-status" role="status">Checking offline availability…</p>
      <button type="button" class="set-btn">Back up boards</button>
      <p>Backup includes boards, folders and embedded pictures. Video attachments are stored separately and are not included.</p>`;
    if (host) host.prepend(about);
    const status = about.querySelector('[role="status"]');
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.ready.then(() => { status.textContent = 'Ready to open offline on this device. Linked images and online services may still need internet.'; });
    } else status.textContent = 'Offline installation needs an HTTPS website.';
    about.querySelector('button').addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        // Wait for a pending edit to pass the canvas autosave debounce.
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = await MB.list();
        const boards = await Promise.all(index.map(b => MB.load(b.id)));
        const blob = new Blob([JSON.stringify({ format: 'ipad-planning-backup', version: 1, created: new Date().toISOString(), folders: await MB.folders(), boards }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = `planning-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        status.textContent = 'Backup download requested. Save it in Files.';
      } catch (error) { status.textContent = `Backup failed: ${error.message}`; }
      finally { button.disabled = false; }
    });
  });
})();
