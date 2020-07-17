// lines - octave idx, columns - frequency for concrete note

const OCTAVES = [
  [16, 17, 18, 19, 21, 22, 23, 25, 26, 28, 29, 31],
  [33, 35, 37, 39, 41, 44, 46, 49, 52, 55, 58, 62],
  [65, 69, 73, 78, 82, 87, 93, 98, 104, 110, 117, 124],
  [131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247],
  [262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494],
  [523, 554, 587, 622, 659, 699, 740, 784, 831, 880, 932, 988],
  [1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976],
  [2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951],
  [4186, 4435, 4699, 4978, 5274, 5588, 5920, 6272, 6645, 7040, 7459, 7902],
];

const noteToIdxDictionary = new Map([
  ["C", 0],
  ["C#", 1],
  ["D", 2],
  ["D#", 3],
  ["E", 4],
  ["F", 5],
  ["F#", 6],
  ["G", 7],
  ["G#", 8],
  ["A", 9],
  ["A#", 10],
  ["B", 11],
]);

export const NOTE_STRUCT_SIZE = 6; // 6 bytes

export const getNoteFrequency = (noteName) => {
  const name = noteName.replace(/[0-9]/, "");
  let octaveIdx = parseInt(noteName.slice(-1), 10);
  const noteIdx = noteToIdxDictionary.get(name);

  return OCTAVES[octaveIdx][noteIdx];
};

// export const toNoteStruct = (noteName, duration) => {
//   const frequency = getNoteFrequency(noteName);
//   const buffer = new ArrayBuffer(6);
//   const view = new DataView(buffer);

//   view.setUint16(0, frequency, false);
//   view.setFloat32(2, duration, false);

//   return buffer;
// };

// export const fromNoteStruct = (buffer) => {
//   const view = new DataView(buffer);

//   const frequency = view.getUint16(0, false);
//   const duration = view.getFloat32(2, false);

//   console.log(buffer);

//   return [frequency, duration];
// };
