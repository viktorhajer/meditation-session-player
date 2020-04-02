import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {LoadingController, ModalController} from '@ionic/angular';
import {SettingsPage} from './settings/settings.page';
import {ProfileService} from '../services/profile.service';
import {NotificationService} from '../services/notification.service';
import {BackgroundMusicService} from '../services/background-music.service';
import {SessionService} from '../services/session.service';
import {Session} from '../models/session.model';
import {DateHelper} from '../services/date.helper';
import {MalaPage} from './mala/mala.page';

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
  currentSession: Session;
  displayFooter = 'inactive';
  private sessionHistory = [];
  private loadingModal: Promise<HTMLIonLoadingElement>;
  private seekTimeout: any;

  constructor(private loadingCtrl: LoadingController,
              private modalController: ModalController,
              private bgMusic: BackgroundMusicService,
              public sessionService: SessionService,
              public notification: NotificationService,
              public profileService: ProfileService) {
    this.refreshDocuments();
    this.profileService.changeProfile.subscribe(() => this.refreshDocuments());
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
      this.notification.refreshCountdownText();
    });

    this.audioElement.addEventListener('ended', () => {
      this.notification.ring().then(() => {
        if (this.isLastPlaying() || !this.profileService.isRepeatEnabled()) {
          this.resetState();
        } else {
          this.bgMusic.stop();
          this.next();
        }
      });
    });
  }

  openSession(session: Session) {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    if (!!this.currentSession && this.currentSession.id === session.id) {
      this.resetState();
    } else {
      this.notification.resetInterval();
      this.pushIndexHistory(session.id);
      this.currentSession = session;
      this.audioElement.src = '/assets/' + this.currentSession.url;
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

  likeSession(session: Session) {
    this.profileService.toggleLike(session.id);
    this.refreshDocuments();
  }

  hideSession(session: Session) {
    this.profileService.toggleHide(session.id);
    this.refreshDocuments();
  }

  pickRandomSession() {
    let random = Math.floor(Math.random() * this.sessions.length);
    while (this.sessionHistory.indexOf(random) !== -1) {
      random = Math.floor(Math.random() * this.sessions.length);
    }
    this.openSession(this.sessions[random]);
  }

  changeSessionListOrder() {
    this.sessionService.toggleOrder();
    this.refreshDocuments();
  }

  play() {
    this.notification.resumeInterval();
    this.audioElement.play();
    this.bgMusic.play();
  }

  pause() {
    this.notification.pauseInterval();
    this.audioElement.pause();
    this.bgMusic.pause();
  }

  next() {
    let index = this.sessions.indexOf(this.currentSession) + 1;
    if (index >= this.sessions.length) {
      index = 0;
    }
    this.openSession(this.sessions[index]);
  }

  previous() {
    let index = this.sessions.indexOf(this.currentSession) - 1;
    if (index < 0) {
      index = this.sessions.length - 1;
    }
    this.openSession(this.sessions[index]);
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
    return DateHelper.formatTime(this.audioElement.currentTime);
  }

  getDuration(): string {
    return DateHelper.formatTime(this.audioElement.duration);
  }

  getDurationSec(): number {
    return this.audioElement.duration;
  }

  toggleSpeed() {
    this.profileService.toggleSpeed();
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

  openMala() {
    if (this.profileService.profile.malaEnabled) {
      this.modalController.create({
        component: MalaPage
      }).then(modal => modal.present());
    }
  }

  get audioElement(): HTMLAudioElement {
    return this.audioElementRef.nativeElement as HTMLAudioElement;
  }

  private refreshDocuments() {
    this.presentLoading();
    this.sessionService.getSessions()
      .then(sessions => {
        this.sessions = sessions;
        this.dismissLoading();
      });
  }

  private isLastPlaying(): boolean {
    return this.sessions.indexOf(this.currentSession) === (this.sessions.length - 1);
  }

  private setSpeed() {
    if (this.profileService.isSpeedEnabled()) {
      this.audioElement.playbackRate = 1.1;
    } else {
      this.audioElement.playbackRate = 1;
    }
  }

  private resetState() {
    this.currentSession = null;
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

  private pushIndexHistory(index: string) {
    this.sessionHistory.push(index);
    if (this.sessionHistory.length > (this.sessions.length - 1)) {
      this.sessionHistory = this.sessionHistory.slice(Math.floor(this.sessions.length / 2));
    }
  }
}
