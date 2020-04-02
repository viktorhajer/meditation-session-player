import {Injectable} from '@angular/core';
import {RingToneModel} from '../models/ringTone.model';
import {RING_TONE_LIST, ProfileService} from './profile.service';
import {NotificationType} from '../models/notification.model';
import {Vibration} from '@ionic-native/vibration/ngx';
import {DateHelper} from './date.helper';

@Injectable({providedIn: 'root'})
export class NotificationService {

  private audioElement: HTMLAudioElement;
  private timer: number;
  private timerStarted = 0;
  private timerIndex = 0;
  countdownText = '';

  constructor(private profileService: ProfileService,
              private vibration: Vibration) {
  }

  setAudioElement(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
  }

  ring(): Promise<void> {
    const notificationEnabled = this.profileService.profile.notificationEnabled;
    return this.playNotification(notificationEnabled)
      .then(() => this.vibrateDevice(notificationEnabled));
  }

  startInterval() {
    if (this.isTimerEnabled()) {
      if (this.timerIndex !== 0) {
        this.playNotification().then(() => this.vibrateDevice());
      }
      const list = this.profileService.profile.timerInterval;
      if (this.timerIndex < list.length) {
        this.timerStarted = Date.now();
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
    this.timerStarted = 0;
  }

  isTimerActive(): boolean {
    return this.timer != null;
  }

  refreshCountdownText() {
    if (!this.timerStarted) {
      this.countdownText = '';
    }
    const diff1 = this.profileService.profile.timerInterval.length - this.timerIndex;
    const diff2 = this.profileService.profile.timerInterval[this.timerIndex] -
      Math.floor((Date.now() - this.timerStarted) / 1000);
    this.countdownText = DateHelper.formatTime(diff2) + ` (${diff1})`;
  }

  private isTimerEnabled(): boolean {
    return this.profileService.profile.timerEnabled && this.profileService.profile.timerInterval.length > 0;
  }

  private getSelectedRingTone(): RingToneModel {
    return RING_TONE_LIST[this.profileService.profile.ringToneIndex];
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
    return this.profileService.profile.notificationType === NotificationType.RINGING
        || this.profileService.profile.notificationType === NotificationType.RINGING_AND_VIBRATION;
  }

  private isVibrationTypeEnabled(): boolean {
    return this.profileService.profile.notificationType === NotificationType.VIBRATION
        || this.profileService.profile.notificationType === NotificationType.RINGING_AND_VIBRATION;
  }
}
