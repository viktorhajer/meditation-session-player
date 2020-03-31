import {Injectable} from '@angular/core';
import {RingToneModel} from '../models/ringTone.model';
import {SettingsService} from './settings.service';
import {NotificationType} from '../models/notification.model';
import {Vibration} from '@ionic-native/vibration/ngx';
import {RING_TONE_LIST} from '../player/components/settings.page';

@Injectable({providedIn: 'root'})
export class NotificationService {

  private audioElement: HTMLAudioElement;
  private timer: number;

  constructor(private settingsService: SettingsService,
              private vibration: Vibration) {
  }

  setAudioElement(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
  }

  ring(): Promise<void> {
    return this.playNotification().then(() => this.vibrateDevice());
  }

  resetInterval() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  startInterval() {
    this.timer = setTimeout(() => {
    }, 1000);
  }

  private getSelectedRingTone(): RingToneModel {
    return RING_TONE_LIST[this.settingsService.settings.ringToneIndex];
  }

  private playNotification(): Promise<void> {
    if (!!this.audioElement && this.isRingingEnabled()) {
      this.audioElement.src = this.getSelectedRingTone().url;
      this.audioElement.play();
      return new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
    }
    return Promise.resolve();
  }

  private vibrateDevice() {
    if (this.isVibrationEnabled()) {
      this.vibration.vibrate([1000, 200, 1000]);
    }
  }

  private isRingingEnabled(): boolean {
    return this.settingsService.settings.notificationEnabled &&
      (this.settingsService.settings.notificationType === NotificationType.RINGING
        || this.settingsService.settings.notificationType === NotificationType.RINGING_AND_VIBRATION);
  }

  private isVibrationEnabled(): boolean {
    return this.settingsService.settings.notificationEnabled &&
      (this.settingsService.settings.notificationType === NotificationType.VIBRATION
        || this.settingsService.settings.notificationType === NotificationType.RINGING_AND_VIBRATION);
  }
}
