import {Injectable} from '@angular/core';
import {Session} from '../models/session.model';
import {ProfileService} from './profile.service';
import {DateHelper} from './date.helper';
import {File as NativeFile} from '@ionic-native/file/ngx';
import {SessionStateModel} from '../models/session-state.model';

const DURATION_CHECKING_ENABLED = false;

@Injectable({providedIn: 'root'})
export class SessionService {

  private orderAsc = true;
  private cache: Session[] = [];
  private sessionState: SessionStateModel[] = [];
  private hasCordova = false;

  constructor(private profileService: ProfileService,
              private file: NativeFile) {
    this.hasCordova = !!(window as any).cordova;
  }

  getSessions(): Promise<Session[]> {
    return (this.cache.length ? Promise.resolve(this.cache) :
      (this.hasCordova ? this.readFolder() :
        Promise.resolve([
          new Session({name: 'Open_The_Window_Of Your Heart - Meditation.mp3', url: '/assets/example.mp3', lyrics: true}),
          new Session({name: '1Meditation To Improve.mp3', url: '/assets/ringTones/china-bell-ring.mp3'}),
          new Session({name: '2Meditation To Improve.mp3', url: '/assets/ringTones/cell-phone-beep.mp3'})
        ])))
      .then(list => this.cache = list)
      .then(() => {
        this.resetFlags(this.cache);
        this.setFavorites(this.cache);
        this.setHidden(this.cache);
        this.cache.sort((s1, s2) => this.sortSession(s1, s2));
        return this.checkMusicDuration(this.cache).then(() => this.cache);
      });
  }

  isAscendingOrder(): boolean {
    return this.orderAsc;
  }

  toggleOrder() {
    this.orderAsc = !this.orderAsc;
  }

  savePosition(name: string, position: number) {
    const normalizedPosition = Math.floor(position);
    const state = this.sessionState.find(s => s.name === name);
    if (!!state) {
      state.position = normalizedPosition;
    } else {
      this.sessionState.push(new SessionStateModel(name, normalizedPosition));
    }
  }

  getPosition(name: string): number {
    const state = this.sessionState.find(s => s.name === name);
    return !!state ? state.position : 0;
  }

  readLyrics(session: Session): Promise<string> {
    if (session.lyrics && this.hasCordova) {
      return this.file.readAsText(this.file.externalRootDirectory + 'Download/medi', session.name.replace('.mp3', '.srt'));
    } else if (!this.hasCordova) {
      return Promise.resolve('Test');
    }
    return Promise.resolve('');
  }

  private sortSession(s1: Session, s2: Session): number {
    if (s1.liked && s2.liked || (!s1.liked && !s2.liked)) {
      return this.sortByName(s1, s2);
    }
    return s1.liked ? -1 : 0;
  }

  private sortByName(s1: Session, s2: Session): number {
    if (this.orderAsc) {
      return s1.name.toLowerCase().localeCompare(s2.name.toLowerCase());
    }
    return s2.name.toLowerCase().localeCompare(s1.name.toLowerCase());
  }

  private resetFlags(sessions: Session[]) {
    sessions.forEach(s => s.liked = false);
    sessions.forEach(s => s.hidden = false);
  }

  private setFavorites(sessions: Session[]) {
    const favorites = this.profileService.profile.favorites;
    sessions.forEach(s => {
      s.liked = favorites.some(url => url === s.url);
    });
  }

  private setHidden(sessions: Session[]) {
    const hidden = this.profileService.profile.hidden;
    sessions.forEach(s => {
      s.hidden = hidden.some(url => url === s.url);
    });
  }

  private checkMusicDuration(list: Session[]): Promise<any> {
    return !DURATION_CHECKING_ENABLED ? Promise.resolve() : Promise.all(list.map(s => {
      return new Promise((resolve) => {
        const audioTmp = document.createElement('audio') as HTMLAudioElement;
        audioTmp.src = s.url;
        audioTmp.addEventListener('loadedmetadata', () => {
          s.duration = DateHelper.formatTime(Math.round(audioTmp.duration));
          resolve();
        });
      });
    }));
  }

  private readFolder(): Promise<Session[]> {
    return this.file.listDir(this.file.externalRootDirectory, 'Download/medi')
      .then(entries => {
        const sessions = entries.filter(e => e.isFile && e.fullPath.endsWith('.mp3'))
          .map(e => {
            return new Session({name: e.name, url: e.nativeURL});
          });
        entries.filter(e => e.isFile && e.fullPath.endsWith('.srt')).forEach(e => {
          const session = sessions.find(s => this.compareFileNames(s.url, e.nativeURL));
          if (!!session) {
            session.lyrics = true;
          }
        });
        return sessions;
      });
  }

  private compareFileNames(path1: string, path2: string): boolean {
    return path1.substr(0, path1.length - 3) === path2.substr(0, path2.length - 3);
  }
}
