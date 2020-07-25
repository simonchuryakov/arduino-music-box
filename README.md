# arduino-music-box

It's Node.js + Arduino project to play any midi file.

## Prerequisites

1. You need to provide the following environment variables to make it works (the easiest way is to create `.env` file in the project root folder)

```
SERIAL_PORT=<NAME_OF_SERIAL_PORT>
BOUD_RATE=<BOUD_RATE>
MIDI_STORAGE_FOLDER=<MIDI_STORAGE_FOLDER>
```

2. Electronics:
   - Arduino Uno
   - Piezo buzzer
   - Wires
3. Circuit scheme
   1. v1 - https://github.com/simonchuryakov/arduino-music-box/blob/master/docs/circuit_v1.jpg
   2. v2 - https://github.com/simonchuryakov/arduino-music-box/blob/master/docs/circuit_v2.jpg

## How to run

To run the project you have to:

1. Upload sketch file from `src/arduino/play.ino` to your Arduino Uno using Arduino IDE or whatever you use for arduino development
2. Keep Arduino Uno connected to your computer
3. Run in the terminal:

```
npm install
node src/node/index.js
```

By default it will start playing files from `midi-storage` (you can change it in the `index.js`)
