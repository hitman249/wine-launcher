export default class AudioButton {
  events = {
    click: new Audio('click.wav'),
    hover: new Audio('hover.wav'),
  };

  stop() {
    Object.keys(this.events).forEach((event) => {
      if (this.events[event].paused) {
        return;
      }

      this.events[event].pause();
      this.events[event].currentTime = 0;
    });
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return window.app.getPrefix().isSound();
  }

  click() {
    if (!this.isEnabled()) {
      return;
    }

    this.stop();
    this.events.click.volume = 0.4;
    this.events.click.play().then(() => {
    }, () => {
    });
  }

  hover() {
    if (!this.isEnabled()) {
      return;
    }

    this.stop();
    this.events.hover.volume = 0.4;
    this.events.hover.play().then(() => {
    }, () => {
    });
  }
}