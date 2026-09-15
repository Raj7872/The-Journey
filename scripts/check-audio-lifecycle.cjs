const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const timers = new Map(); let timerId = 0;
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('engine/AudioManager/AudioManager.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports: exportsObject, require: () => ({ TIMING: { MUSIC_FADE_OUT: 10, MUSIC_FADE_IN: 10, AMBIENT_FADE: 10 } }), console, process,
  setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id),
});
class Sound {
  constructor() { this.ids = new Set(); this.next = 0; this.unloaded = false; }
  play() { this.ids.add(++this.next); return this.next; }
  stop(id) { this.ids.delete(id); }
  fade() {} volume() {} unload() { this.unloaded = true; this.ids.clear(); }
}
function manager() { const m = new exportsObject.AudioManager(); m.Howl = Sound; m.isInitialized = true; return m; }
function flush() { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); }
const m = manager();
m.playMusic('piano-entrance'); const first = m.howls.get('piano-entrance');
m.playMusic('piano-train'); assert.equal(first.unloaded, false); flush(); assert.equal(first.unloaded, true); assert.equal(m.howls.size, 1);
m.playMusic('piano-entrance'); m.playMusic('piano-train'); flush(); assert.equal(m.howls.get('piano-train').unloaded, false); assert.equal(m.howls.get('piano-train').ids.size, 1);
m.startAmbient('rain-exterior'); m.stopAmbient('rain-exterior'); m.startAmbient('rain-exterior'); flush(); assert.equal(m.howls.get('rain-exterior').ids.size, 1);
m.stopAmbient('rain-exterior'); flush(); assert.equal(m.howls.has('rain-exterior'), false);
m.stopMusic(); assert.ok(timers.size); m.dispose(); assert.equal(timers.size, 0); assert.equal(m.howls.size, 0); assert.equal(m.getState().isMusicPlaying, false);
console.log('PASS: fade lifetime, rapid music revisit, ambient restart, retired audio release, disposal timer cleanup');
