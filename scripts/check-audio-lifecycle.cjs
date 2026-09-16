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
  constructor() { this.ids = new Set(); this.next = 0; this.unloaded = false; this.volumes = new Map(); this.ends = new Map(); }
  play() { this.ids.add(++this.next); return this.next; }
  stop(id) { this.ids.delete(id); }
  fade(from, to, duration, id) { this.volumes.set(id, to); }
  volume(value, id) { if (value === undefined) return this.volumes.get(id) ?? 0; if (id === undefined) this.ids.forEach(i => this.volumes.set(i, value)); else this.volumes.set(id, value); return value; }
  once(event, fn, id) { this.ends.set(id, fn); }
  unload() { this.unloaded = true; this.ids.clear(); }
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

const audio = manager();
audio.setSfxVolume(0.25); audio.playSfx('train-whistle', 0.4);
const whistle = audio.howls.get('train-whistle');
assert.equal(whistle.volume(undefined, 1), 0.1, 'per-effect gain must multiply master');
audio.startAmbient('rain-exterior', 0.4);
assert.equal(audio.howls.get('rain-exterior').volume(undefined, 1), 0.1);
audio.setSfxVolume(0);
assert.equal(whistle.volume(undefined, 1), 0, 'already playing effect must mute');
assert.equal(audio.howls.get('rain-exterior').volume(undefined, 1), 0, 'ambience must follow effects slider');
audio.setSfxVolume(0.5); audio.mute(); audio.setSfxVolume(0.75);
assert.equal(whistle.volume(undefined, 1), 0, 'slider must not unmute');
audio.unmute(); assert.ok(Math.abs(whistle.volume(undefined, 1) - 0.3) < 1e-9);
whistle.ends.get(1)(); assert.equal(audio.effectGains.has('train-whistle'), false);
audio.dispose();
console.log('PASS: SFX master gain, active effects, ambient slider, mute/unmute, finished effect cleanup');
