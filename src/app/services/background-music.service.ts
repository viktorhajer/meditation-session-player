import {Injectable} from '@angular/core';
import {ProfileService} from './profile.service';
import {PlatformService} from './platform.service';

@Injectable({providedIn: 'root'})
export class BackgroundMusicService {

  private audioElement: HTMLAudioElement;

  constructor(private profileService: ProfileService,
              private platformService: PlatformService) {
  }

  setAudioElement(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
    this.audioElement.volume = this.profileService.profile.musicVolume / 100;
    if (this.platformService.isAndroid()) {
      this.audioElement.src = this.platformService.convertFileSrc(this.profileService.profile.musicUrl);
    } else {
      this.audioElement.src = this.profileService.profile.musicUrl;
    }
    this.audioElement.autoplay = false;
  }

  play() {
    if (this.profileService.profile.musicEnabled && !!this.profileService.profile.musicUrl) {
      this.refreshMusic();
      this.audioElement.autoplay = true;
      if (this.profileService.profile.musicEnabled && this.audioElement.paused) {
        this.audioElement.play();
      }
    }
  }

  pause() {
    this.audioElement.pause();
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.autoplay = false;
    if (this.profileService.profile.restartMusic) {
      this.audioElement.currentTime = 0;
    }
  }

  refreshMusic() {
    if (!(this.audioElement.src === this.profileService.profile.musicUrl)) {
      if (this.platformService.isAndroid()) {
        this.audioElement.src = this.platformService.convertFileSrc(this.profileService.profile.musicUrl);
      } else {
        this.audioElement.src = this.profileService.profile.musicUrl;
      }
      this.audioElement.pause();
    }
    this.audioElement.volume = this.profileService.profile.musicVolume / 100;
    if (!this.profileService.profile.musicEnabled) {
      this.audioElement.pause();
    }
  }
}
