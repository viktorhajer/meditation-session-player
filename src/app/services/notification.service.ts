import {Injectable} from '@angular/core';
import {RingToneModel} from '../models/ringTone.model';
import {RING_TONE_LIST, SettingsService} from './settings.service';
import {NotificationType} from '../models/notification.model';
import {Vibration} from '@ionic-native/vibration/ngx';

@Injectable({providedIn: 'root'})
export class NotificationService {

  private audioElement: HTMLAudioElement;
  private timer: number;
  private timerIndex = 0;

  constructor(private settingsService: SettingsService,
              private vibration: Vibration) {
  }

  setAudioElement(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
  }

  ring(): Promise<void> {
    const notificationEnabled = this.settingsService.settings.notificationEnabled;
    return this.playNotification(notificationEnabled)
      .then(() => this.vibrateDevice(notificationEnabled));
  }

  startInterval() {
    if (this.settingsService.settings.timerEnabled) {
      if (this.timerIndex !== 0) {
        this.playNotification().then(() => this.vibrateDevice());
      }
      const list = this.settingsService.settings.timerInterval;
      if (this.timerIndex < list.length) {
        this.timer = setTimeout(() => {
          this.timerIndex++;
          this.startInterval();
        }, list[this.timerIndex] * 1000);
      } else {
        this.resetInterval();
      }
    }
  }

  resetInterval() {
    clearTimeout(this.timer);
    this.timer = null;
    this.timerIndex = 0;
  }

  private getSelectedRingTone(): RingToneModel {
    return RING_TONE_LIST[this.settingsService.settings.ringToneIndex];
  }

  private playNotification(enabled = true): Promise<void> {
    if (!!this.audioElement && enabled && this.isRingingTypeEnabled()) {
      this.audioElement.src = this.getSelectedRingTone().url;
      this.audioElement.play();
      return new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
    }
    return Promise.resolve();
  }

  private vibrateDevice(enabled = true) {
    if (enabled && this.isVibrationTypeEnabled()) {
      this.vibration.vibrate([1000, 200, 1000]);
    }
  }

  private isRingingTypeEnabled(): boolean {
    return this.settingsService.settings.notificationType === NotificationType.RINGING
        || this.settingsService.settings.notificationType === NotificationType.RINGING_AND_VIBRATION;
  }

  private isVibrationTypeEnabled(): boolean {
    return this.settingsService.settings.notificationType === NotificationType.VIBRATION
        || this.settingsService.settings.notificationType === NotificationType.RINGING_AND_VIBRATION;
  }
}
