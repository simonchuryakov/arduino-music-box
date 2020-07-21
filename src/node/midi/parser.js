import fs from "fs";
import midi from "@tonejs/midi";
import _groupBy from "lodash/groupBy.js";
import _chunk from "lodash/chunk.js";

import {
  getFrequencyByNote,
  getTicksToMsFn,
  getPPQ,
  getBPM,
} from "./helper.js";

const SEPARATOR = ",";
const NOTE_SEPARATOR = ";";
const MIN_NOTE_NAME_LENGTH = 2;
const MIDI_META_FILE_EXTENSION = ".json";

const toNotes = (track, toMs) => {
  const mainThemeNotes = Object.values(_groupBy(track.notes, "ticks")).map(
    (notes) => notes[0]
  );

  let previousTicks = 0;
  let previousDurationTicks = 0;

  return mainThemeNotes.reduce(
    (melody, { pitch, octave, name, ticks, durationTicks }, idx) => {
      let compoundName = "";

      if (pitch !== undefined && octave !== undefined) {
        compoundName = `${pitch}${octave}`;
      }

      if (name !== undefined && name.length >= MIN_NOTE_NAME_LENGTH) {
        compoundName = name;
      }

      if (compoundName.length === 0) {
        throw new Error(`Not enough info to play note ${idx}`);
      }

      // Push the pause in the melody if needed
      if (previousTicks + previousDurationTicks < ticks) {
        melody.push([-1, toMs(ticks - previousTicks - previousDurationTicks)]);
      }

      const frequency = getFrequencyByNote(compoundName);
      const durationMs = toMs(durationTicks);

      melody.push([frequency, durationMs]);
      previousTicks = ticks;
      previousDurationTicks = durationTicks;

      return melody;
    },
    []
  );
};

export const parse = (
  midiFilePath,
  mainTrackIdx = 0,
  shouldGenerateMetaJson = false
) => {
  const binaryData = fs.readFileSync(midiFilePath);
  const data = new midi.Midi(binaryData);

  const ppq = getPPQ(data.header);
  const bpm = getBPM(data.header);
  const toMs = getTicksToMsFn(ppq, bpm);

  const notes = toNotes(data.tracks[mainTrackIdx], toMs);

  if (shouldGenerateMetaJson) {
    fs.writeFileSync(
      `${midiFilePath}${MIDI_META_FILE_EXTENSION}`,
      JSON.stringify(data)
    );
  }

  let melodyDuration = 0;
  const melody = notes.reduce((melody, [frequency, duration]) => {
    melody.push({
      data: `${frequency}${SEPARATOR}${duration}${NOTE_SEPARATOR}`,
      wait: duration,
    });

    melodyDuration += duration;

    return melody;
  }, []);

  return {
    melody,
    duration: melodyDuration,
  };
};
