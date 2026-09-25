window.bukankalaIndexedDb = (() => {
  const database = 'bukankala-offline';
  const store = 'records';
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(database, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function set(key, value) { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).put(value, key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
  async function get(key) { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction(store, 'readonly'); const req = tx.objectStore(store).get(key); req.onsuccess = () => resolve(req.result ?? null); req.onerror = () => reject(req.error); }); }
  async function remove(key) { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
  return { set, get, remove };
})();
window.bukankalaConnectivity = {
  isOnline: () => navigator.onLine
};

window.bukankalaUi = {
  downloadText: (fileName, content, contentType) => {
    const blob = new Blob([content], { type: contentType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
};
window.bukankalaShare = {
  share: async (title, text) => {
    if (navigator.share) { await navigator.share({ title, text }); return true; }
    await navigator.clipboard.writeText(text); return false;
  }
};
window.bukankalaVoice = {
  enabled: true,
  configure: settings => { window.bukankalaVoice.enabled = settings?.voiceInputEnabled !== false; },
  listen: () => new Promise((resolve, reject) => { if (!window.bukankalaVoice.enabled) { reject(new Error('Voice input is disabled in appsettings.json.')); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { reject(new Error('Voice input is not supported on this browser.')); return; }
    const recognition = new Recognition();
    recognition.lang = 'en-ZA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => resolve(event.results[0][0].transcript);
    recognition.onerror = event => { if (event.error === 'no-speech' || event.error === 'aborted') resolve(''); else reject(new Error(event.error || 'Voice input failed.')); };
    recognition.start();
  })
};
window.bukankalaSpeech = {
  enabled: true,
  configure: settings => { window.bukankalaSpeech.enabled = settings?.enabled !== false; window.bukankalaVoice.configure(settings); },
  speak: text => { if (!window.bukankalaSpeech.enabled) return; if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } }
};window.bukankalaActivity = {
  start: dotnet => {
    const notify = () => dotnet.invokeMethodAsync('Activity');
    ['click','keydown','touchstart','pointerdown'].forEach(name => window.addEventListener(name, notify, { passive: true }));
  }
};