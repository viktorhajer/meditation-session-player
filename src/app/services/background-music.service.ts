import {Injectable} from '@angular/core';
import {SettingsService} from './settings.service';
import {RingToneModel} from '../models/ringTone.model';
import {BACKGROUND_MUSIC_LIST, RING_TONE_LIST} from '../player/components/settings.page';

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
    if (this.settingsService.settings.musicEnabled && this.audioElement.paused) {
      this.audioElement.play();
    }
  }

  pause() {
    this.audioElement.pause();
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.autoplay = false;
    if (this.settingsService.settings.restartMusic) {
      this.audioElement.currentTime = 0;
    }
  }

  refreshMusic() {
    if (!this.audioElement.src.endsWith(this.getSelectedMusic().url)) {
      this.audioElement.src = this.getSelectedMusic().url;
    }
    this.audioElement.volume = this.settingsService.settings.musicVolume / 100;
    if (!this.settingsService.settings.musicEnabled) {
      this.audioElement.pause();
    }
  }

  private getSelectedMusic(): RingToneModel {
    return BACKGROUND_MUSIC_LIST[this.settingsService.settings.musicIndex];
  }
}
