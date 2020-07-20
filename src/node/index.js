import path from "path";
import dotenv from "dotenv";

import { parse } from "./midi/parser.js";
import { SerialProxy } from "./serial/proxy.js";

dotenv.config();

const serialPort = process.env.SERIAL_PORT;
const serialOptions = {
  baudRate: parseInt(process.env.BOUD_RATE, 10),
};

const midiStoragePath = path.join(
  process.cwd(),
  process.env.MIDI_STORAGE_FOLDER
);

const proxy = new SerialProxy();
const playList = ["Harry_Potter_mono.mid", "Nokia_tune.mid"];

const playMelody = (melody) => {
  let shouldWait = 0;

  melody.forEach((data) => {
    setTimeout(() => {
      proxy.write(data.data);
    }, shouldWait);
    shouldWait += data.wait;
  });
};

const startPlaylist = (tracks) => {
  let shouldWait = 0;

  tracks.forEach((fileName) => {
    const track = parse(path.join(midiStoragePath, fileName));

    setTimeout(() => playMelody(track.melody), shouldWait);
    shouldWait += track.duration;
  });
};

proxy.init(serialPort, serialOptions, (error) => {
  if (error) {
    console.log("Error: ", error.message);
  }

  // Need to wait a bit, otherwise a few first notes are gone
  setTimeout(() => startPlaylist(playList), 100);
});
