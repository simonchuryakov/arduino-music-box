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

const fileName = "Mario_Bros_mono.mid";

const proxy = new SerialProxy();
const midiData = parse(path.join(midiStoragePath, fileName));

proxy.init(serialPort, serialOptions, (error) => {
  if (error) {
    console.log("Error: ", error.message);
  }
});

if (!proxy.isOpen()) {
  let shouldWait = 0;

  midiData.forEach((data) => {
    setTimeout(() => {
      proxy.write(data.data);
    }, shouldWait);
    shouldWait += data.wait;
  });
}
