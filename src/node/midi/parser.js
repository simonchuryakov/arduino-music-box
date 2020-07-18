import fs from "fs";
import Midi from "@tonejs/midi";
import _groupBy from "lodash/groupBy.js";
import _chunk from "lodash/chunk.js";

import { getFrequencyByNote, toMs } from "./helper.js";

const SEPARATOR = ",";
const NOTE_SEPARATOR = ";";
const NOTES_CHUNK_SIZE = 5;
const MIN_NOTE_NAME_LENGTH = 2;
const MIDI_META_FILE_EXTENSION = ".json";

const toNotes = (track) => {
  const mainThemeNotes = Object.values(_groupBy(track.notes, "time")).map(
    (notes) => notes[0]
  );

  let previousTime = 0;
  let previousNoteDuration = 0;

  return mainThemeNotes.reduce(
    (melody, { pitch, octave, duration, name, time }, idx) => {
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
      if (previousTime + previousNoteDuration < time) {
        melody.push([-1, toMs(time - previousTime - previousNoteDuration)]);
      }

      const frequency = getFrequencyByNote(compoundName);
      const durationMs = toMs(duration);

      melody.push([frequency, durationMs]);
      previousTime = time;
      previousNoteDuration = duration;

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
  const notes = toNotes(midi.tracks[mainTrackIdx]);

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
