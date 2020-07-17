import SerialPort from "serialport";

export class SerialProxy {
  init(port, options, errorFn) {
    this.port = new SerialPort(port, options, errorFn);
  }

  isOpen() {
    if (!this.port) {
      return false;
    }

    return this.port.isOpen;
  }

  write(data) {
    if (this.port) {
      this.port.write(data);
    }
  }
}
