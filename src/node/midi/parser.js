import fs from "fs";
import Midi from "@tonejs/midi";
import _groupBy from "lodash/groupBy.js";
import _chunk from "lodash/chunk.js";

import {
  getFrequencyByNote,
  getConvertTicksToMsFn,
  getPPQ,
  getBPM,
} from "./helper.js";

const SEPARATOR = ",";
const NOTE_SEPARATOR = ";";
const NOTES_CHUNK_SIZE = 5;
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
  shouldGenerateMetaFile = false
) => {
  const midiData = fs.readFileSync(midiFilePath);
  const midi = new Midi.Midi(midiData);

  const ppq = getPPQ(midi.header);
  const bpm = getBPM(midi.header);
  const toMs = getConvertTicksToMsFn(ppq, bpm);

  const notes = toNotes(midi.tracks[mainTrackIdx], toMs);

  if (shouldGenerateMetaFile) {
    fs.writeFileSync(
      `${midiFilePath}${MIDI_META_FILE_EXTENSION}`,
      JSON.stringify(midi)
    );
  }

  return _chunk(notes, NOTES_CHUNK_SIZE).map((notes) =>
    notes.reduce(
      (notesFrame, [frequency, duration]) => {
        notesFrame.data += `${frequency}${SEPARATOR}${duration}${NOTE_SEPARATOR}`;
        notesFrame.wait += duration;

        return notesFrame;
      },
      { wait: 0, data: "" }
    )
  );
};
