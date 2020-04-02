import {Component} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {ProfileService} from '../../services/profile.service';
import {BackgroundMusicService} from '../../services/background-music.service';
import {NotificationService} from '../../services/notification.service';
import {HELP} from '../../models/help.model';
import {SessionService} from '../../services/session.service';
import {Session} from '../../models/session.model';

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
  musicUrl: string;
  musicVolume: number;
  restartMusic: boolean;
  themeIndex: number;
  selectedProfile: string;
  malaEnabled: boolean;
  malaBeads: number;
  sessions: Session[] = [];

  constructor(private modalCtrl: ModalController,
              private notification: NotificationService,
              private alertController: AlertController,
              public profileService: ProfileService,
              public sessionService: SessionService,
              public bgMusic: BackgroundMusicService) {
    this.fillSettingsForm();
    this.profileService.changeProfile.subscribe(() => this.fillSettingsForm());
    this.sessionService.getSessions().then(sessions => this.sessions = sessions);
  }

  changedMalaEnabled() {
    this.profileService.setMalaEnabled(this.malaEnabled);
  }

  changedMalaBeads() {
    this.profileService.setMalaMalaBeads(this.malaBeads);
  }

  changedNotificationEnabled() {
    this.profileService.setNotificationEnabled(this.notificationEnabled);
  }

  changedNotificationType() {
    this.profileService.setNotificationType(this.notificationType);
  }

  changedRingToneIndex() {
    this.profileService.setRingToneIndex(this.ringToneIndex);
  }

  changedTimerEnabled() {
    this.notification.resetInterval();
    this.profileService.setTimerEnabled(this.timerEnabled);
  }

  changedTimerInterval() {
    this.notification.resetInterval();
    const interval = this.timerInterval.split(',')
      .map(parts => parts.trim()).filter(p => !isNaN(Number(p))).map(p => Number(p));
    this.profileService.setTimerInterval(interval);
  }

  changedMusicEnabled() {
    this.profileService.setMusicEnabled(this.musicEnabled);
    this.bgMusic.refreshMusic();
  }

  changedMusicUrl() {
    this.profileService.setMusicUrl(this.musicUrl);
    this.bgMusic.refreshMusic();
  }

  changedMusicVolume() {
    this.profileService.setMusicVolume(this.musicVolume);
    this.bgMusic.refreshMusic();
  }

  changedRestartMusic() {
    this.profileService.setRestartMusic(this.restartMusic);
  }

  changedThemeIndex() {
    this.profileService.setThemeIndex(this.themeIndex);
  }

  changedProfile() {
    if (this.profileService.profile.name !== this.selectedProfile) {
      this.profileService.setProfile(this.selectedProfile);
    }
  }

  showHelp(subHeader = '', messageKey = '') {
    this.alertController.create({
      header: 'Information', subHeader, message: HELP[messageKey],
      buttons: [{text: 'Ok', role: 'cancel', cssClass: 'secondary'}]
    }).then(t => t.present());
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
            if (!!data.name.trim().length && !this.profileService.isProfileNameExists(name)) {
              this.profileService.newProfile(data.name.trim());
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
        {text: 'Yes', handler: () => this.profileService.deleteCurrentProfile()},
        {text: 'No', role: 'cancel', cssClass: 'secondary'}]
    }).then(t => t.present());
  }

  close() {
    this.modalCtrl.dismiss();
  }

  private fillSettingsForm() {
    this.notificationEnabled = this.profileService.profile.notificationEnabled;
    this.notificationType = this.profileService.profile.notificationType;
    this.ringToneIndex = this.profileService.profile.ringToneIndex;
    this.timerEnabled = this.profileService.profile.timerEnabled;
    this.timerInterval = this.profileService.profile.timerInterval.join(',');
    this.musicEnabled = this.profileService.profile.musicEnabled;
    this.musicUrl = this.profileService.profile.musicUrl;
    this.musicVolume = this.profileService.profile.musicVolume;
    this.restartMusic = this.profileService.profile.restartMusic;
    this.themeIndex = this.profileService.profile.themeIndex;
    this.selectedProfile = this.profileService.profile.name;
    this.malaEnabled = this.profileService.profile.malaEnabled;
    this.malaBeads = this.profileService.profile.malaBeads;
  }
}
