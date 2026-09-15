# Visual depth and memory update

## Visual changes

- Added a shared, scene-aware foreground treatment to the 17 rendered story scene IDs (credits stay visually unchanged). Station rooms use beveled architectural edges and quiet directional light; platforms use canopy/near-platform silhouettes; the six sunrise/ending settings use foreground meadow grasses. Small drifting motes respect reduced motion.
- Corrected the floor joint spacing: joints now compress toward the horizon, with converging lengthwise seams, a warmer light pool and darker edges.
- Improved shared furniture face shading and contact shadows, affecting existing props without moving collectibles or changing their labels.
- Reworked station lamps into suspended metal fixtures with shaded housings and gentle light falloff, preserving their emotional color response and ambient sway.
- Replaced the train's separate front/side crossfade with one continuously approaching perspective carriage. Added a curved roof, shaded end face, recessed window frames, curtains and seat silhouettes, brass trim, wheels, suspension, steps and a hinged door.
- Preserved the train's nameplate, handwritten note, steam, conductor with lantern, sound cues and existing 55-second choreography.

This uses lightweight SVG/CSS perspective and shading. It is an illustrated depth upgrade, not a photorealistic mesh-based conversion of every scene.

## Functionality changes

- The boarding hit area now follows the carriage doorway and is available only when the door opens. Boarding remains voluntary.
- Inactive music and ambience unload after their fades. Returning to a scene reloads its audio; rapid revisits retain the active playback instance.
- Audio disposal cancels outstanding fade/cleanup timers.
- The train playlist streams songs using HTML audio instead of decoding an entire song into a Web Audio buffer. Browser streaming/buffering behavior can differ, especially on slow connections.
- Atmosphere rendering uses pixel ratio 1 and switches to demand rendering when the tab is hidden or reduced motion is requested.
- Window condensation resolution is capped at 1.5 pixel ratio; pointer wipe coordinates and interactions are unchanged.
- Fog color is reused instead of allocating a new Three.js color every frame, and the shader material is disposed on unmount.
- Added optional NEXT_BUILD_DIR support so review builds can use a separate Next.js cache.

Story text, memories, collection requirements, notebook, save format, scene progression, proposal choices and playlist contents were not edited.

## Verification

- TypeScript check passed.
- ESLint passed for the changed application files; production build also runs lint/type validation.
- Audio regression check: `node scripts/check-audio-lifecycle.cjs`. Covers fade lifetime, rapid music revisits, ambient restarts, inactive audio release and disposal timer cleanup.
- Headless Chrome rendered the stopped/open train composition; inspected `artifacts/train-review.png`. This is an isolated visual preview, not a screenshot of the full interactive journey.
- Production static export generated in `out` using `NEXT_BUILD_DIR=.next-review`.

## Remaining verification limits

A complete interactive playthrough, mobile hit-target checks, actual audio playback and long-session browser/GPU memory measurements have not been performed. These changes reduce specific allocations and retained audio, but do not establish a measured full-run memory reduction or prove the reported multi-GB issue is fully resolved.
