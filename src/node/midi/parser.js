import fs from "fs";
import Midi from "@tonejs/midi";
import _groupBy from "lodash/groupBy.js";
import _chunk from "lodash/chunk.js";

import { getNoteFrequency } from "../helper.js";

const toNotes = (track) => {
  const mainThemeNotes = Object.values(_groupBy(track.notes, "time")).map(
    (notes) => notes[0]
  );

  return mainThemeNotes.reduce(
    (arduinoData, { pitch, octave, duration, name }, idx) => {
      let compoundName = "";

      if (pitch !== undefined && octave !== undefined) {
        compoundName = `${pitch}${octave}`;
      }

      if (name !== undefined && name.length >= 2) {
        compoundName = name;
      }

      if (compoundName.length === 0) {
        throw new Error(`Not enough info to play note ${idx}`);
      }

      const frequency = getNoteFrequency(compoundName);
      const durationMs = Math.round(duration * 1000);

      arduinoData.push([frequency, durationMs]);

      return arduinoData;
    },
    []
  );
};

export const parse = (midiFilePath, mainTrackIdx = 0) => {
  const midiData = fs.readFileSync(midiFilePath);
  const midi = new Midi.Midi(midiData);
  fs.writeFileSync(midiFilePath + ".json", JSON.stringify(midi));
  const notes = toNotes(midi.tracks[mainTrackIdx]);

  return _chunk(notes, 5).map((notes) =>
    notes.reduce(
      (notesFrame, [frequency, duration]) => {
        notesFrame.data += `${frequency},${duration};`;
        notesFrame.wait += duration;

        return notesFrame;
      },
      { wait: 0, data: "" }
    )
  );
};
