import {Injectable} from '@angular/core';
import {SettingsModel} from '../models/settings.model';
import {RingToneModel} from '../models/ringTone.model';

const APPLICATION_KEY = 'MeditationPlayerSettings';

export const RING_TONE_LIST = [
  {url: '/assets/ringTones/cell-phone-beep.mp3', name: 'Cell Phone Beep'},
  {url: '/assets/ringTones/cell-phone-vibrate.mp3', name: 'Cell Phone Vibrate'},
  {url: '/assets/ringTones/china-bell-ring.mp3', name: 'China Bell Ring'}
];

export const BACKGROUND_MUSIC_LIST = [
  {url: '/assets/music_example.mp3', name: 'Cell Phone Beep'}
];

export const THEME_LIST: { title: string, className: string }[] = [
  {title: 'Sahasrara', className: 'purple'},
  {title: 'Vishuddha', className: 'pink'},
  {title: 'Ajna', className: 'blue'},
  {title: 'Anahata', className: 'green'},
  {title: 'Manipura', className: 'yellow'},
  {title: 'Swadhisthana', className: 'orange'},
  {title: 'Muladhara', className: 'black-red'},
];

@Injectable({providedIn: 'root'})
export class SettingsService {

  settings = new SettingsModel();

  constructor() {
    const data = localStorage.getItem(APPLICATION_KEY);
    if (data) {
      this.settings = JSON.parse(data);
      this.setThemeIndex();
    } else {
      this.setThemeIndex(0);
    }
  }

  getRingTones(): RingToneModel[] {
    return RING_TONE_LIST;
  }

  getBackgroundMusics(): RingToneModel[] {
    return BACKGROUND_MUSIC_LIST;
  }

  getThemes(): { title: string, className: string }[] {
    return THEME_LIST;
  }

  setRingToneIndex(value = 0) {
    this.settings.ringToneIndex = value;
    this.saveSettings();
  }

  setNotificationEnabled(flag = true) {
    this.settings.notificationEnabled = flag;
    this.saveSettings();
  }

  setNotificationType(value = 0) {
    this.settings.notificationType = value;
    this.saveSettings();
  }

  setTimerEnabled(flag = true) {
    this.settings.timerEnabled = flag;
    this.saveSettings();
  }

  setTimerInterval(interval = []) {
    this.settings.timerInterval = interval;
    this.saveSettings();
  }

  setMusicEnabled(enabled = true) {
    this.settings.musicEnabled = enabled;
    this.saveSettings();
  }

  setMusicIndex(value = 0) {
    this.settings.musicIndex = value;
    this.saveSettings();
  }

  setMusicVolume(value = 100) {
    this.settings.musicVolume = value;
    this.saveSettings();
  }

  setRestartMusic(flag = true) {
    this.settings.restartMusic = flag;
    this.saveSettings();
  }

  setThemeIndex(value?: number) {
    if (!!value || value === 0) {
      this.settings.themeIndex = value;
    }
    document.body.classList.value = '';
    document.body.classList.toggle(this.getSelectedThemeClass());
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

  private getSelectedThemeClass(): string {
    return THEME_LIST[this.settings.themeIndex].className;
  }

  private saveSettings() {
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(this.settings));
  }
}
