import {EventEmitter, Injectable} from '@angular/core';
import {ProfileModel, ProfilesModel} from '../models/profile.model';
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

  profiles: ProfilesModel;
  profile = new ProfileModel();
  changeProfile = new EventEmitter<void>();

  constructor() {
    const data = localStorage.getItem(APPLICATION_KEY);
    if (data) {
      this.profiles = JSON.parse(data);
      this.profile = this.profiles.profiles.find(p => p.selected);
    } else {
      this.profile.selected = true;
      this.profiles = {profiles: [this.profile]};
    }
    this.setThemeIndex();
  }

  newProfile(name: string) {
    const oldProfile = new ProfileModel();
    Object.getOwnPropertyNames(this.profile).forEach(f => {
      oldProfile[f] = this.profile[f];
    });
    oldProfile.selected = false;
    this.profile.name = name;
    this.profiles.profiles.push(oldProfile);
    this.saveProfile();
  }

  setProfile(name: string) {
    const oldName = this.profile.name;
    this.profile = this.profiles.profiles.find(p => p.name === name);
    this.profile.selected = true;
    this.profiles.profiles.find(p => p.name === oldName).selected = false;
    this.setThemeIndex();
    this.changeProfile.emit();
  }

  isProfileNameExists(name: string): boolean {
    return this.profiles.profiles.some(p => p.name === name);
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
    this.profile.ringToneIndex = value;
    this.saveProfile();
  }

  setNotificationEnabled(flag = true) {
    this.profile.notificationEnabled = flag;
    this.saveProfile();
  }

  setNotificationType(value = 0) {
    this.profile.notificationType = value;
    this.saveProfile();
  }

  setTimerEnabled(flag = true) {
    this.profile.timerEnabled = flag;
    this.saveProfile();
  }

  setTimerInterval(interval = []) {
    this.profile.timerInterval = interval;
    this.saveProfile();
  }

  setMusicEnabled(enabled = true) {
    this.profile.musicEnabled = enabled;
    this.saveProfile();
  }

  setMusicIndex(value = 0) {
    this.profile.musicIndex = value;
    this.saveProfile();
  }

  setMusicVolume(value = 100) {
    this.profile.musicVolume = value;
    this.saveProfile();
  }

  setRestartMusic(flag = true) {
    this.profile.restartMusic = flag;
    this.saveProfile();
  }

  setThemeIndex(value?: number) {
    if (!!value || value === 0) {
      this.profile.themeIndex = value;
    }
    document.body.classList.value = '';
    document.body.classList.toggle(this.getSelectedThemeClass());
    this.saveProfile();
  }

  toggleFavorite(id: number) {
    const length = this.profile.favorites.length;
    this.profile.favorites = this.profile.favorites.filter(f => f !== id);
    if (length === this.profile.favorites.length) {
      this.profile.favorites.push(id);
    }
    this.saveProfile();
  }

  isRepeatEnabled(): boolean {
    return this.profile.repeat === 1;
  }

  toggleRepeat() {
    this.profile.repeat = (this.profile.repeat + 1) % 2;
    this.saveProfile();
  }

  isSpeedEnabled(): boolean {
    return this.profile.speed === 1;
  }

  toggleSpeed() {
    this.profile.speed = (this.profile.speed + 1) % 2;
    this.saveProfile();
  }

  private getSelectedThemeClass(): string {
    return THEME_LIST[this.profile.themeIndex].className;
  }

  private saveProfile() {
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(this.profiles));
  }
}
