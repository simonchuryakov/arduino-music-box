import SerialPort from "serialport";
import moment from "moment";

export class SerialProxy {
  init(port, options, openCallback) {
    this.port = new SerialPort(port, options, openCallback);
  }

  isOpen() {
    if (!this.port) {
      return false;
    }

    return this.port.isOpen;
  }

  write(data) {
    if (this.port) {
      console.log(`${moment().format("DD/MM/YY HH:mm:ss.ms")}: ${data}`);

      this.port.write(data);
    }
  }
}
