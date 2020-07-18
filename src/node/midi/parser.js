import fs from "fs";
import Midi from "@tonejs/midi";
import _groupBy from "lodash/groupBy.js";
import _chunk from "lodash/chunk.js";

import { getNoteFrequency } from "../helper.js";

const toNotes = (track) => {
  const mainThemeNotes = Object.values(_groupBy(track.notes, "time")).map(
    (notes) => notes[0]
  );

  let previousTime = 0;
  let previousNoteDuration = 0;

  return mainThemeNotes.reduce(
    (arduinoData, { pitch, octave, duration, name, time }, idx) => {
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

      if (previousTime + previousNoteDuration < time) {
        arduinoData.push([
          -1,
          Math.round((time - previousTime - previousNoteDuration) * 1000),
        ]);
      }

      const frequency = getNoteFrequency(compoundName);
      const durationMs = Math.round(duration * 1000);

      arduinoData.push([frequency, durationMs]);
      previousTime = time;
      previousNoteDuration = duration;

      return arduinoData;
    },
    []
  );
};

export const parse = (
  midiFilePath,
  mainTrackIdx = 0,
  shouldGenerateJson = false
) => {
  const midiData = fs.readFileSync(midiFilePath);
  const midi = new Midi.Midi(midiData);
  const notes = toNotes(midi.tracks[mainTrackIdx]);

  if (shouldGenerateJson) {
    fs.writeFileSync(midiFilePath + ".json", JSON.stringify(midi));
  }

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
