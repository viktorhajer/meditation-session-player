import {Injectable} from '@angular/core';
import {SettingsModel} from '../models/settings.model';
import {RingToneModel} from '../models/ringTone.model';

const APPLICATION_KEY = 'MeditationPlayerSettings';

const RING_TONES = [
  {url: '/assets/ringTones/cell-phone-beep.mp3', name: 'Cell Phone Beep'},
  {url: '/assets/ringTones/cell-phone-vibrate.mp3', name: 'Cell Phone Vibrate'},
  {url: '/assets/ringTones/china-bell-ring.mp3', name: 'China Bell Ring'}
];

@Injectable({providedIn: 'root'})
export class SettingsService {

  settings = new SettingsModel();

  constructor() {
    const data = localStorage.getItem(APPLICATION_KEY);
    if (data) {
      this.settings = JSON.parse(data);
    }
    console.log(this.settings);
  }

  getRingTones(): RingToneModel[] {
    return RING_TONES;
  }

  getSelectedRingTone(): RingToneModel {
    console.log(RING_TONES);
    console.log(this.settings.ringToneIndex);
    console.log(RING_TONES[this.settings.ringToneIndex]);
    return RING_TONES[this.settings.ringToneIndex];
  }

  setRingToneIndex(ringToneIndex = 0) {
    this.settings.ringToneIndex = ringToneIndex;
    this.saveSettings();
  }

  toggleNotification() {
    this.settings.notificationIndex = (this.settings.notificationIndex + 1) % 3;
    this.saveSettings();
  }

  isRepeatEnabled(): boolean {
    return this.settings.repeat === 1;
  }

  toggleRepeat() {
    this.settings.repeat = (this.settings.repeat + 1) % 2;
    this.saveSettings();
  }

  isSpeedEnabled(): boolean {
    return this.settings.speed === 1;
  }

  toggleSpeed() {
    this.settings.speed = (this.settings.speed + 1) % 2;
    this.saveSettings();
  }

  private saveSettings() {
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(this.settings));
  }
}
