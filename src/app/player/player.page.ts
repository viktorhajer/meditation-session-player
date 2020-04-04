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
import {LyricsPage} from './lyrics/lyrics.page';

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
  organizeMod = false;
  started = false;
  private loadingModalPromise: Promise<HTMLIonLoadingElement>;
  private seekTimeout: any;

  constructor(private loadingCtrl: LoadingController,
              private modalController: ModalController,
              private bgMusic: BackgroundMusicService,
              public sessionService: SessionService,
              public notification: NotificationService,
              public profileService: ProfileService) {
    this.refreshDocuments(true);
    this.profileService.changeProfile.subscribe(() => this.refreshDocuments());
  }

  ngAfterViewInit() {
    this.notification.setAudioElement(this.ringingElementRef.nativeElement as HTMLAudioElement);
    this.bgMusic.setAudioElement(this.musicElementRef.nativeElement as HTMLAudioElement);

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.dismissLoading();
    });
    this.audioElement.addEventListener('timeupdate', () => {
      const range = document.querySelector('ion-range');
      if (!!range && !range.classList.contains('range-pressed')) {
        const diff = Math.abs((range.value as any) - Math.floor(this.audioElement.currentTime));
        if (diff > 2 && this.started) {
          this.audioElement.currentTime = range.value as any;
        } else {
          range.value = this.audioElement.currentTime;
        }
      }
      this.started = false;
      this.notification.refreshCountdownText();
    });

    this.audioElement.addEventListener('ended', () => {
      this.sessionService.savePosition(this.currentSession.name, 0);
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

  getSessions(): Session[] {
    return this.organizeMod ? this.sessions : this.sessions.filter(s => !s.hidden);
  }

  openSession(session: Session, savePosition = false) {
    if (this.organizeMod) {
      this.hideSession(session);
    } else {
      if (this.currentSession) {
        this.sessionService.savePosition(this.currentSession.name, savePosition ? this.audioElement.currentTime : 0);
      }
      this.started = true;
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      if (!!this.currentSession && this.currentSession.url === session.url) {
        this.resetState();
      } else {
        this.presentLoading();
        this.notification.resetInterval();
        this.currentSession = session;
        this.audioElement.src = this.currentSession.url;
        this.audioElement.play().then(() => {
          this.displayFooter = 'active';
          this.audioElement.currentTime = this.sessionService.getPosition(session.name);
        });
        const range = document.querySelector('ion-range');
        if (!!range) {
          range.value = 0;
        }
        this.notification.startInterval();
        this.bgMusic.play();
      }
    }
  }

  likeSession(session: Session) {
    this.profileService.toggleLike(session.url);
    this.refreshDocuments();
  }

  hideSession(session: Session) {
    this.profileService.toggleHide(session.url);
    this.refreshDocuments();
  }

  showAll() {
    this.profileService.toggleHide([]);
    this.refreshDocuments();
  }

  hideAll() {
    this.profileService.toggleHide(this.getSessions().map(s => s.url));
    this.refreshDocuments();
  }

  pickRandomSession() {
    const sessions = this.getSessions();
    if (sessions.length > 0) {
      let random = Math.floor(Math.random() * sessions.length);
      while (this.currentSession === sessions[random]) {
        random = Math.floor(Math.random() * sessions.length);
      }
      this.openSession(sessions[random]);
    }
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

  toggleOrganizeMod() {
    this.organizeMod = !this.organizeMod;
    if (this.organizeMod) {
      this.resetState();
    }
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

  setProfile(name: string) {
    this.profileService.setProfile(name);
  }

  isLyricsAvailable(): boolean {
    return !!this.currentSession;
  }

  openLyrics() {
    this.modalController.create({
      component: LyricsPage
    }).then(modal => modal.present());
  }

  get audioElement(): HTMLAudioElement {
    return this.audioElementRef.nativeElement as HTMLAudioElement;
  }

  private refreshDocuments(force = false) {
    if (force) {
      this.presentLoading();
    }
    this.sessionService.getSessions()
      .then(sessions => {
        this.sessions = sessions;
        this.dismissLoading();
      });
  }

  private isLastPlaying(): boolean {
    return this.sessions.indexOf(this.currentSession) === (this.sessions.length - 1);
  }

  private resetState() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.currentSession = null;
    this.displayFooter = 'inactive';
    this.notification.resetInterval();
    this.bgMusic.stop();
  }

  private presentLoading() {
    if (!this.loadingModalPromise) {
      this.loadingModalPromise = this.loadingCtrl.create({
        message: 'Please Wait...',
        mode: 'ios'
      }).then(modal => {
        setTimeout(() => this.dismissLoading(), 4000);
        modal.present();
        return modal;
      });
    }
    return this.loadingModalPromise;
  }

  private dismissLoading() {
    if (this.loadingModalPromise) {
      this.loadingModalPromise.then(modal => modal.dismiss());
      this.loadingModalPromise = null;
    }
  }
}
