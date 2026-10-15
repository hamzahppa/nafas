# Breathwork for Amazfit Active 3 Premium — Requirements

Oct 14, 2026 · @P1\_RSDM

## Purpose and scope

Build a Zepp OS mini program for the Amazfit Active 3 Premium that reproduces the user-visible behavior of the Breathwork activity on the Garmin Forerunner 165: four guided presets, haptic and visual pacing, session recording, and a post-session summary.

- **Method:** behavioral clone. Requirements come from Garmin's published manuals and blog, plus observation of the FR165. No Garmin firmware, code, assets or Firstbeat algorithms are copied.
- **"Exact same":** matched at the level of what the user sees and feels. Where Garmin does not publish a value (ramp step timing, haptic pattern), it is marked **\[MEASURE\]** and must be captured from the FR165 using the protocol in the last section.
- **Naming:** Personal use, sideloaded only. Presets keep Garmin's names (Coherence, Relax and Focus, Relax and Focus (Short), Tranquility); app name and icon are your own.
- **Out of scope for v1:** publishing to the Zepp App Store, a phone companion, cloud sync, Garmin Connect-style graphs, and stress-triggered relax reminders.

## Reference behavior (Garmin FR165)

The FR165 Breathwork is a built-in activity profile with four fixed presets, each a structured workout that ramps the breathing pattern from normal toward a target pattern.

| Preset | Purpose | Duration | Target pattern (s) |
| --- | --- | --- | --- |
| Coherence | Calm alertness | 15 min | Inhale 6 · Exhale 6 |
| Relax and Focus | Relax body, focus mind | 15 min | Inhale 4 · Hold 4 · Exhale 4 · Hold 4 (box) |
| Relax and Focus (Short) | Same, shorter | 5 min | Inhale 4 · Hold 4 · Exhale 4 · Hold 4 |
| Tranquility | Lower stress, prepare for sleep | 10 min | Inhale 4 · Hold 7 · Exhale 8 |

**Session flow on the watch**

1. From the watch face: upper-right button → Activities → Other → Breathwork.
2. Pick a preset, then Do Workout if prompted.
3. Upper-right button starts the activity; on-screen instructions pace each breath.
4. Lower-right button skips to the next step of the breathwork phase.
5. Upper-right button stops; the user picks Save.
6. The save screen shows average respiration rate and heart rate; All Stats adds max heart rate and stress change.

In Garmin Connect the saved activity shows graphs of respiration rate, stress and heart rate across the session.

Sources: [Garmin manual, Recording a Breathwork Activity](https://www8.garmin.com/manuals/webhelp/GUID-25E3235D-44D2-4384-A591-DD1D71BEBCB1/EN-AU/GUID-B3BD9AA0-2235-43BC-AAD0-D38008420EAD.html) · [Garmin blog, Mindful Breathing with Garmin](https://www.garmin.com/en-SG/blog/?p=407)

## Target platform (Amazfit Active 3 Premium)

The watch can do the pacing and heart-rate parts natively; respiration rate and a system-level workout record are the two things Zepp OS does not hand a third-party app.

| Item | Active 3 Premium | Impact on the clone |
| --- | --- | --- |
| OS | Zepp OS 5.0 | Build as a Zepp OS mini program (JavaScript, `@zos/*` APIs) |
| Display | 1.32" round AMOLED, 466 × 466 | Design for a round 466 px canvas; dark UI saves power on AMOLED |
| Inputs | Touchscreen + four buttons | Map Garmin's start/stop and skip buttons to physical keys |
| Heart rate | Optical HR; `HeartRate.onCurrentChange` for continuous readings | Live HR, average and max are achievable |
| Stress | `Stress.getCurrent` / `onChange`, value with timestamp | Stress before/after possible, but readings may be minutes old |
| Haptics | `Vibrator` API | Phase-change cues are achievable |
| Respiration rate | No public API found | Must be estimated (see FR-08) |
| Sports history | No public API found for writing a system workout | Sessions saved inside the app, not in Zepp's activity list |
| Speaker | Present | Audio cues per FR-17 (beyond Garmin parity) |

Sources: [the5krunner specs](https://the5krunner.com/specs/amazfit/active-3-premium/) · [Gadgets & Wearables specs](https://gadgetsandwearables.com/?p=18597043) · [Zepp OS HeartRate API](https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/HeartRate/) · [Zepp OS Stress API](https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Stress/) · [Zepp OS Mini Program intro](https://docs.zepp.com/docs/guides/framework/device/intro/)

## Functional requirements

Seventeen requirements cover the Garmin feature set; FR-08 and FR-11 are adapted because Zepp OS lacks the matching system APIs, FR-16 is an optional extra, and FR-17 adds audio.

| ID | Requirement | Acceptance criteria | Parity |
| --- | --- | --- | --- |
| FR-01 | Preset list | App opens to a list of the four presets with name, one-line purpose and duration | Match |
| FR-02 | Preset detail | Selecting a preset shows target pattern and duration, with a Start action (equivalent of Do Workout) | Match |
| FR-03 | Structured breathing engine | Each preset is a sequence of steps; each step has a breath pattern (inhale, hold, exhale, hold, in seconds) and a duration. Patterns ramp from a natural rhythm to the target pattern. Step timings **\[MEASURE\]** | Match |
| FR-04 | Pacing visual | A shape grows on inhale, holds still on hold, shrinks on exhale. Shows phase label, seconds left in the phase, and time left in the session | Match |
| FR-05 | Haptic cues | A vibration marks every phase change so the session works with eyes closed. Pattern per phase **\[MEASURE\]** | Match |
| FR-06 | Controls | Start, pause/resume, skip to next step, stop. Stop offers Save, Resume, Discard. Mapped to physical buttons, touch as backup | Match |
| FR-07 | Heart rate | Continuous HR from session start to stop; live value on screen; average and max computed | Match |
| FR-08 | Respiration rate | Average breaths/min shown in the summary. v1 computes it from completed paced breaths over active time, labelled as paced rate. Optional v2: estimate from HR variation | Adapted |
| FR-09 | Stress change | Stress read at start and at end; change = end minus start. If either reading is older than a set limit, show "—" instead of a number | Match |
| FR-10 | Session summary | On save: duration, average respiration, average HR. A second page (All Stats): max HR, stress change | Match |
| FR-11 | Session history | Saved sessions listed on the watch, newest first, each opening its summary and HR/phase timeline | Adapted |
| FR-12 | Session completion | After the last step, a distinct haptic plays and the stop/save prompt opens | Match |
| FR-13 | Screen stays usable | Screen does not turn off from wrist-drop or palm cover during an active session | Match |
| FR-14 | Interruption handling | A call, alarm or app exit pauses the session; reopening offers Resume or Save | Match |
| FR-15 | Data recorded per session | Per-second HR, phase timeline, step changes, skips, pauses, start/end stress | Match |
| FR-16 | Custom pattern (optional) | User sets inhale/hold/exhale/hold (0–30 s) and duration | Extra |
| FR-17 | Audio cues | Speaker plays a distinct tone at each phase change (inhale, hold, exhale) and at session end, in sync with haptics. On/off and volume set per session; off by default when the watch is in silent mode | Extra |

&#91;embedded content: session states · FR-06, FR-12, FR-14\]

The stop prompt also offers Resume, which returns to Running; that edge is left out of the drawing for clarity.

## Non-functional requirements

Timing accuracy and battery are the two that decide whether the clone feels like the original; the targets below are proposed, not Garmin-published.

| ID | Category | Requirement | Target |
| --- | --- | --- | --- |
| NFR-01 | Timing accuracy | Phase changes scheduled from the session start time, not chained timers, so error does not build up | ≤ 100 ms per transition; ≤ 0.5 s drift over 15 min |
| NFR-02 | Haptic latency | Vibration fires with the visual phase change | ≤ 50 ms apart |
| NFR-03 | Animation | Breathing shape moves smoothly | No visible stutter; ≥ 20 fps |
| NFR-04 | Battery | A full 15-minute session with HR on | ≤ 3% of battery |
| NFR-05 | Startup | Launch to preset list | ≤ 2 s |
| NFR-06 | Readability | Phase label readable at arm's length and in bright light | Label ≥ 36 px; high-contrast colors on black |
| NFR-07 | Eyes-closed use | A full session can be followed by haptics alone | Pass a blindfolded run of every preset |
| NFR-08 | Reliability | Session state saved during the run, so a crash keeps the data | Checkpoint every 30 s; ≤ 30 s of data lost |
| NFR-09 | Storage | History bounded on the 4 GB watch | Keep last 100 sessions, oldest removed first |
| NFR-10 | Privacy | Data stays on the watch; only HR and stress permissions requested | No network calls in v1 |
| NFR-11 | Compatibility | Runs on Zepp OS 5.0, 466 × 466 round screen | Tested on device, not only simulator |
| NFR-12 | Maintainability | Presets defined as data, not code | A new preset needs no code change |
| NFR-13 | Localization | UI strings externalized | English + Bahasa Indonesia |
| NFR-14 | Legal | No Garmin code, artwork or icons; Garmin preset names allowed since the app is personal use only | Own app name and icon; not distributed |

## Parity gaps and measurement plan

Three values can't come from public sources: the ramp schedule, the haptic patterns, and the stress algorithm. The first two you can measure on your FR165; the third stays a known difference.

**Known gaps**

- **Stress:** Garmin uses Firstbeat's HRV model; the clone uses Zepp's own stress value. Both use a 0–100 scale, but the numbers are not interchangeable.
- **Respiration:** Garmin measures it from the wrist sensor; the clone reports paced rate in v1.
- **Activity record:** sessions won't appear in Zepp's workout list or sync to Strava.

**Decisions**

- Keep Garmin's preset names (personal use).
- Personal sideload only, not published to the Zepp App Store.
- Add audio cues through the speaker (FR-17).

**Measurement protocol on the FR165**

1. Run each preset once with a screen recording from your phone camera, held over the watch.
2. From the video, log for every step: start time, pattern (inhale/hold/exhale/hold seconds), and how many breaths it lasts.
3. Note what each phase change feels like: one buzz or two, short or long, and whether inhale and exhale differ.
4. Note what the skip button does: skip one breath, or jump to the next step.
5. Record what the screen shows when paused, at completion, and on both summary pages.
6. Fill the results into a preset table; that table becomes the data file for NFR-12.

- [ ] Coherence measured
- [ ] Relax and Focus measured
- [ ] Relax and Focus (Short) measured
- [ ] Tranquility measured
