import {Injectable} from '@angular/core';
import {BACKGROUND_MUSIC_LIST, SettingsService} from './settings.service';
import {RingToneModel} from '../models/ringTone.model';

@Injectable({providedIn: 'root'})
export class BackgroundMusicService {

  private audioElement: HTMLAudioElement;

  constructor(private settingsService: SettingsService) {
  }

  setAudioElement(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
    this.audioElement.volume = 0.5;
    this.audioElement.src = this.getSelectedMusic().url;
    this.audioElement.autoplay = false;
  }

  play() {
    this.refreshMusic();
    this.audioElement.autoplay = true;
    if (this.settingsService.profile.musicEnabled && this.audioElement.paused) {
      this.audioElement.play();
    }
  }

  pause() {
    this.audioElement.pause();
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.autoplay = false;
    if (this.settingsService.profile.restartMusic) {
      this.audioElement.currentTime = 0;
    }
  }

  refreshMusic() {
    if (!this.audioElement.src.endsWith(this.getSelectedMusic().url)) {
      this.audioElement.src = this.getSelectedMusic().url;
    }
    this.audioElement.volume = this.settingsService.profile.musicVolume / 100;
    if (!this.settingsService.profile.musicEnabled) {
      this.audioElement.pause();
    }
  }

  private getSelectedMusic(): RingToneModel {
    return BACKGROUND_MUSIC_LIST[this.settingsService.profile.musicIndex];
  }
}
