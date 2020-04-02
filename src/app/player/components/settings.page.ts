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
  selectedProfile: string;

  constructor(private modalCtrl: ModalController,
              private settings: SettingsService,
              private notification: NotificationService,
              private alertController: AlertController,
              public bgMusic: BackgroundMusicService) {
    this.fillSettingsForm();
    this.settings.changeProfile.subscribe(() => this.fillSettingsForm());
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

  changedProfile() {
    this.settings.setProfile(this.selectedProfile);
  }

  showHelp(subHeader = '', messageKey = '') {
    this.alertController.create({header: 'Information', subHeader, message: HELP[messageKey]}).then(t => t.present());
  }

  showProfileForm() {
    this.alertController.create({
      header: 'Create new profile',
      inputs: [{name: 'name', type: 'text', placeholder: 'Profile name'}],
      buttons: [{text: 'Cancel', role: 'cancel', cssClass: 'secondary'},
        {
          text: 'Ok',
          handler: (data) => {
            const name = data.name.trim();
            if (!!data.name.trim().length && !this.settings.isProfileNameExists(name)) {
              this.settings.newProfile(data.name.trim());
            }
          }
        }]
    }).then(t => t.present());
  }

  confirmDelete() {
    this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure to delete the profile?',
      buttons: [
        {text: 'Yes', handler: () => this.settings.deleteCurrentProfile()},
        {text: 'No', role: 'cancel', cssClass: 'secondary'}]
    }).then(t => t.present());
  }

  close() {
    this.modalCtrl.dismiss();
  }

  private fillSettingsForm() {
    this.notificationEnabled = this.settings.profile.notificationEnabled;
    this.notificationType = this.settings.profile.notificationType;
    this.ringToneIndex = this.settings.profile.ringToneIndex;
    this.timerEnabled = this.settings.profile.timerEnabled;
    this.timerInterval = this.settings.profile.timerInterval.join(',');
    this.musicEnabled = this.settings.profile.musicEnabled;
    this.musicIndex = this.settings.profile.musicIndex;
    this.musicVolume = this.settings.profile.musicVolume;
    this.restartMusic = this.settings.profile.restartMusic;
    this.themeIndex = this.settings.profile.themeIndex;
    this.selectedProfile = this.settings.profile.name;
  }
}
