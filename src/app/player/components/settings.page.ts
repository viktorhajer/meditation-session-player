import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SettingsService} from '../../services/settings.service';
import {BackgroundMusicService} from '../../services/background-music.service';

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

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings.page.html'
})
export class SettingsPage {

  notificationEnabled: boolean;
  notificationType: number;
  ringToneIndex: number;
  timerEnabled: boolean;
  timerInterval: string;
  musicEnabled: boolean;
  musicIndex: number;
  musicVolume: number;
  restartMusic: boolean;
  themeIndex: number;

  constructor(private modalCtrl: ModalController,
              private settings: SettingsService,
              public bgMusic: BackgroundMusicService) {
    this.notificationEnabled = this.settings.settings.notificationEnabled;
    this.notificationType = this.settings.settings.notificationType;
    this.ringToneIndex = this.settings.settings.ringToneIndex;
    this.timerEnabled = this.settings.settings.timerEnabled;
    this.timerInterval = this.settings.settings.timerInterval.join(',');
    this.musicEnabled = this.settings.settings.musicEnabled;
    this.musicIndex = this.settings.settings.musicIndex;
    this.musicVolume = this.settings.settings.musicVolume;
    this.restartMusic = this.settings.settings.restartMusic;
    this.themeIndex = this.settings.settings.themeIndex;
  }

  changedNotificationEnabled() {
    this.settings.setNotificationEnabled(this.notificationEnabled);
  }

  changedNotificationType() {
    this.settings.setNotificationType(this.notificationType);
  }

  changedRingToneIndex() {
    this.settings.setRingToneIndex(this.ringToneIndex);
  }

  changedTimerEnabled() {
    this.settings.setTimerEnabled(this.timerEnabled);
  }

  changedTimerInterval() {
    const interval = this.timerInterval.split(',')
      .map(parts => parts.trim()).filter(p => !isNaN(Number(p))).map(p => Number(p));
    this.settings.setTimerInterval(interval);
  }

  changedMusicEnabled() {
    this.settings.setMusicEnabled(this.musicEnabled);
    this.bgMusic.refreshMusic();
  }

  changedMusicIndex() {
    this.settings.setMusicIndex(this.musicIndex);
    this.bgMusic.refreshMusic();
  }

  changedMusicVolume() {
    this.settings.setMusicVolume(this.musicVolume);
    this.bgMusic.refreshMusic();
  }

  changedRestartMusic() {
    this.settings.setRestartMusic(this.restartMusic);
  }

  changedThemeIndex() {
    this.settings.setThemeIndex(this.themeIndex);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
