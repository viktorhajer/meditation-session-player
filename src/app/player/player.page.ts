import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {LoadingController, ModalController} from '@ionic/angular';
import {SettingsPage} from './components/settings.page';
import {SettingsService} from '../services/settings.service';
import {NotificationService} from '../services/notification.service';
import {BackgroundMusicService} from '../services/background-music.service';
import {SessionService} from '../services/session.service';
import {Session} from '../models/session.model';

@Component({
  selector: 'app-player',
  templateUrl: 'player.page.html',
  animations: [
    trigger('showHide', [
      state(
        'active',
        style({
          top: 0,
          opacity: 1
        })
      ),
      state(
        'inactive',
        style({
          top: '100px',
          opacity: 0
        })
      ),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out'))
    ])
  ],
  styleUrls: ['player.page.scss']
})
export class PlayerPage implements AfterViewInit {

  @ViewChild('audioElement', {static: false}) private audioElementRef: ElementRef;
  @ViewChild('ringingElement', {static: false}) private ringingElementRef: ElementRef;
  @ViewChild('musicElement', {static: false}) private musicElementRef: ElementRef;

  sessions: Session[] = [];
  currentFile: { index: number, file: { name: string, url: string } } = null;
  displayFooter = 'inactive';
  private indexHistory = [];
  private loadingModal: Promise<HTMLIonLoadingElement>;
  private seekTimeout: any;

  constructor(private loadingCtrl: LoadingController,
              private modalController: ModalController,
              private notification: NotificationService,
              private bgMusic: BackgroundMusicService,
              private sessionService: SessionService,
              public settingsService: SettingsService) {
    this.getDocuments();
  }

  ngAfterViewInit() {
    this.notification.setAudioElement(this.ringingElementRef.nativeElement as HTMLAudioElement);
    this.bgMusic.setAudioElement(this.musicElementRef.nativeElement as HTMLAudioElement);
    this.audioElement.addEventListener('timeupdate', () => {
      const range = document.querySelector('ion-range');
      if (!!range && !range.classList.contains('range-pressed')) {
        const diff = Math.abs((range.value as any) - Math.floor(this.audioElement.currentTime));
        if (diff > 2) {
          this.audioElement.currentTime = range.value as any;
        } else {
          range.value = this.audioElement.currentTime;
        }
      }
    });
    this.audioElement.addEventListener('ended', () => {
      this.notification.ring().then(() => {
        if (this.isLastPlaying() || !this.settingsService.isRepeatEnabled()) {
          this.resetState();
        } else {
          this.bgMusic.stop();
          this.next();
        }
      });
    });
  }

  getDocuments() {
    this.presentLoading();
    this.sessionService.getSessions()
      .then(sessions => {
        this.sessions = sessions;
        this.dismissLoading();
      });
  }

  openSession(file, index) {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    if (!!this.currentFile && this.currentFile.index === index) {
      this.resetState();
    } else {
      this.pushIndexHistory(index);
      this.currentFile = {index, file};
      this.audioElement.src = '/assets/' + this.currentFile.file.url;
      this.audioElement.play().then(() => {
        this.displayFooter = 'active';
        this.setSpeed();
      });
      const range = document.querySelector('ion-range');
      if (!!range) {
        range.value = 0;
      }
      this.notification.startInterval();
      this.bgMusic.play();
    }
  }

  pickRandomSession() {
    let random = Math.floor(Math.random() * this.sessions.length);
    while (this.indexHistory.indexOf(random) !== -1) {
      random = Math.floor(Math.random() * this.sessions.length);
    }
    this.openSession(this.sessions[random], random);
  }

  play() {
    this.audioElement.play();
    this.bgMusic.play();
  }

  pause() {
    this.audioElement.pause();
    this.bgMusic.pause();
  }

  next() {
    const index = this.currentFile.index + 1;
    const file = this.sessions[index];
    this.openSession(file, index);
  }

  previous() {
    const index = this.currentFile.index - 1;
    const file = this.sessions[index];
    this.openSession(file, index);
  }

  isFirstPlaying(): boolean {
    return this.currentFile.index === 0;
  }

  isLastPlaying(): boolean {
    return this.currentFile.index === this.sessions.length - 1;
  }

  onSeekChange(event) {
    const range = document.querySelector('ion-range');
    if (!!range && range.classList.contains('range-pressed')) {
      if (this.seekTimeout) {
        clearTimeout(this.seekTimeout);
        this.seekTimeout = null;
      }
      this.seekTimeout = setTimeout(() => {
        this.audioElement.currentTime = event.detail.value;
      }, 300);
    }
  }

  getCurrentTime(): string {
    return this.formatTime(this.audioElement.currentTime);
  }

  getDuration(): string {
    return this.formatTime(this.audioElement.duration);
  }

  getDurationSec(): number {
    return this.audioElement.duration;
  }

  toggleSpeed() {
    this.settingsService.toggleSpeed();
    this.setSpeed();
  }

  openSettings() {
    this.modalController.create({
      component: SettingsPage
    }).then(modal => {
      this.pause();
      modal.present();
    });
  }

  get audioElement(): HTMLAudioElement {
    return this.audioElementRef.nativeElement as HTMLAudioElement;
  }

  private setSpeed() {
    if (this.settingsService.isSpeedEnabled()) {
      this.audioElement.playbackRate = 1.1;
    } else {
      this.audioElement.playbackRate = 1;
    }
  }

  private resetState() {
    this.currentFile = null;
    this.displayFooter = 'inactive';
    this.notification.resetInterval();
    this.bgMusic.stop();
  }

  private presentLoading() {
    this.getLoading().then(l => l.present());
  }

  private dismissLoading() {
    this.getLoading().then(l => l.dismiss());
  }

  private getLoading(): Promise<HTMLIonLoadingElement> {
    if (!this.loadingModal) {
      this.loadingModal = this.loadingCtrl.create({
        message: 'Please Wait...',
        mode: 'ios'
      });
    }
    return this.loadingModal;
  }

  private formatTime(time: number): string {
    if (!time) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return this.formatTimePart(minutes) + ':' + this.formatTimePart(seconds);
  }

  private formatTimePart(value: number): string {
    return (value >= 10 ? '' : '0') + value;
  }

  private pushIndexHistory(index: number) {
    this.indexHistory.push(index);
    if (this.indexHistory.length > (this.sessions.length - 1)) {
      this.indexHistory = this.indexHistory.slice(Math.floor(this.sessions.length / 2));
    }
  }
}
