import {Injectable} from '@angular/core';
import {RingToneModel} from '../models/ringTone.model';
import {ProfileService, RING_TONE_LIST} from './profile.service';
import {NotificationType} from '../models/notification.model';
import {Vibration} from '@ionic-native/vibration/ngx';
import {DateHelper} from './date.helper';
import {TimerAction} from '../models/timer-action.model';

@Injectable({providedIn: 'root'})
export class NotificationService {

  private audioElement: HTMLAudioElement;
  private timer: number;
  private timerStarted = 0;
  private timerIndex = 0;
  private actions: {stop: () => void, next: () => void, prev: () => void};
  countdownText = '';

  constructor(private profileService: ProfileService,
              private vibration: Vibration) {
  }

  setActions(stop: () => void, next: () => void, prev: () => void) {
    this.actions = {stop, next, prev};
  }

  setAudioElement(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
  }

  ring(enabled = false): Promise<void> {
    const notificationEnabled = enabled || this.profileService.profile.notificationEnabled;
    this.vibrateNotification(notificationEnabled);
    return this.ringNotification(notificationEnabled);
  }

  startInterval() {
    if (this.isTimerEnabled()) {
      if (this.timerIndex !== 0) {
        this.ring(true);
      }
      const list = this.profileService.profile.timerPeriods;
      if (this.timerIndex < list.length) {
        this.timerStarted = Date.now();
        this.timer = setTimeout(() => {
          this.timerIndex++;
          this.startInterval();
        }, list[this.timerIndex] * 1000);
      } else {
        this.resetInterval();
        if (this.profileService.profile.timerRepeated) {
          this.startInterval();
        }
        this.doAction();
      }
    }
  }

  resetInterval() {
    clearTimeout(this.timer);
    this.timer = null;
    this.timerIndex = 0;
    this.timerStarted = 0;
  }

  pauseInterval() {
    // TODO
  }

  resumeInterval() {
    // TODO
  }

  isTimerActive(): boolean {
    return this.timer != null;
  }

  refreshCountdownText() {
    if (!this.timerStarted) {
      this.countdownText = '';
    }
    const diff1 = this.profileService.profile.timerPeriods.length - this.timerIndex;
    const diff2 = this.profileService.profile.timerPeriods[this.timerIndex] -
      Math.floor((Date.now() - this.timerStarted) / 1000);
    this.countdownText = DateHelper.formatTime(diff2) + ` (${diff1})`;
  }

  ringNotification(enabled = true, src?: string): Promise<void> {
    if (!!this.audioElement && enabled && this.isRingingTypeEnabled()) {
      this.audioElement.src = !!src ? src : this.getSelectedRingTone().url;
      this.audioElement.play();
      return new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
    }
    return Promise.resolve();
  }

  vibrateNotification(enabled = true, sequence = [1000]) {
    if (enabled && this.isVibrationTypeEnabled()) {
      this.vibration.vibrate(sequence);
    }
  }

  private doAction() {
    if (this.actions) {
      if (this.profileService.profile.timerAfterAction === TimerAction.STOP) {
        this.actions.stop();
      } else if (this.profileService.profile.timerAfterAction === TimerAction.NEXT) {
        this.actions.next();
      } else if (this.profileService.profile.timerAfterAction === TimerAction.PREV) {
        this.actions.prev();
      }
    }
  }

  private isTimerEnabled(): boolean {
    return this.profileService.profile.timerEnabled && this.profileService.profile.timerPeriods.length > 0;
  }

  private getSelectedRingTone(): RingToneModel {
    return RING_TONE_LIST[this.profileService.profile.ringToneIndex];
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
