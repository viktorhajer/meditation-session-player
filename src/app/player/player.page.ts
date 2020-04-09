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
import {LyricsService} from '../services/lyrics.service';
import {PlatformService} from '../services/platform.service';

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
  private loadingModalPromise: Promise<HTMLIonLoadingElement>;
  private seekTimeout: any;

  constructor(private loadingCtrl: LoadingController,
              private modalController: ModalController,
              private bgMusic: BackgroundMusicService,
              private lyricsService: LyricsService,
              private platformService: PlatformService,
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

  getSessions(): Session[] {
    return this.organizeMod ? this.sessions : this.sessions.filter(s => !s.hidden);
  }

  openSession(session: Session) {
    if (this.organizeMod) {
      this.hideSession(session);
    } else {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      if (!!this.currentSession && this.currentSession.url === session.url) {
        this.resetState();
      } else {
        this.presentLoading();
        this.notification.resetInterval();
        if (this.platformService.isAndroid()) {
          this.audioElement.src = this.platformService.convertFileSrc(session.url);
        } else {
          this.audioElement.src = session.url;
        }
        this.audioElement.play().then(() => {
          this.currentSession = session;
          this.displayFooter = 'active';
          if (!!this.lyricsService.dialog && session.lyrics) {
            this.openLyrics();
          } else if (!!this.lyricsService.dialog && !session.lyrics) {
            this.lyricsService.closeDialog();
          }
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

  isPaused(): boolean {
    return this.audioElement.paused;
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
    let index = this.getSessions().indexOf(this.currentSession) + 1;
    if (index === 0) {
      return;
    }
    if (index >= this.getSessions().length) {
      index = 0;
    }
    this.openSession(this.getSessions()[index]);
  }

  previous() {
    let index = this.getSessions().indexOf(this.currentSession) - 1;
    if (index === -2) {
      return;
    }
    if (index < 0) {
      index = this.getSessions().length - 1;
    }
    this.openSession(this.getSessions()[index]);
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
    return !!this.currentSession && !!this.currentSession.lyrics;
  }

  openLyrics() {
    this.sessionService.readLyrics(this.currentSession).then(content => {
      this.lyricsService.title = this.currentSession.name;
      this.lyricsService.content = content;
      if (!this.lyricsService.dialog) {
        this.modalController.create({
          component: LyricsPage,
          cssClass: 'lyrics-modal',
          componentProps: {
            isPausedFunction: () => this.isPaused(),
            playFunction: () => this.play(),
            pauseFunction: () => this.pause(),
            prevFunction: () => this.previous(),
            nextFunction: () => this.next()
          }
        }).then(modal => {
          modal.present();
          this.lyricsService.dialog = modal;
        });
      } else if (document.getElementsByClassName('lyrics-modal').length === 0) {
        this.lyricsService.dialog = null;
        this.openLyrics();
      }
    }).catch(e => console.error(e));
  }

  refreshPage(event) {
    this.sessionService.getSessions()
      .then(sessions => {
        this.sessions = sessions;
        event.target.complete();
      });
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
      })
      .catch(e => console.error('sessions error', e));
  }

  private isLastPlaying(): boolean {
    return this.getSessions().indexOf(this.currentSession) === (this.getSessions().length - 1);
  }

  private resetState() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.lyricsService.closeDialog();
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
