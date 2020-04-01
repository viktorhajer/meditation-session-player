import {Component} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {SettingsService} from '../../services/settings.service';
import {BackgroundMusicService} from '../../services/background-music.service';
import {NotificationService} from '../../services/notification.service';
import {HELP} from '../../models/help.model';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
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
              private notification: NotificationService,
              private alertController: AlertController,
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
    this.notification.resetInterval();
    this.settings.setTimerEnabled(this.timerEnabled);
  }

  changedTimerInterval() {
    this.notification.resetInterval();
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

  showHelp(subHeader = '', messageKey = '') {
    this.alertController.create({header: 'Information', subHeader, message: HELP[messageKey]}).then(t => t.present());
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
