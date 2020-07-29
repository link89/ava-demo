import { EventEmitter } from 'events';

const SIGNAL_EVT = Symbol();

class Semaphore {

  ee: EventEmitter;

  constructor(private size: number) {
    this.ee = new EventEmitter();
  }

  async wait() {
    while (this.size - 1 < 0)  {
      await new Promise((resolve) => this.ee.on(SIGNAL_EVT, resolve));
    }
    this.size -= 1;
  }

  signal() {
    this.size += 1;
    this.ee.emit(SIGNAL_EVT);
  }
}

export const semaphore = new Semaphore(2);
