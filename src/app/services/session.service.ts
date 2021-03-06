import {Injectable} from '@angular/core';
import {Session} from '../models/session.model';
import {ProfileService} from './profile.service';
import {File as NativeFile} from '@ionic-native/file/ngx';
import {PlatformService} from './platform.service';

@Injectable({providedIn: 'root'})
export class SessionService {

  private orderAsc = true;
  private cache: Session[] = [];

  constructor(private profileService: ProfileService,
              private platformService: PlatformService,
              private file: NativeFile) {
  }

  private static resetFlags(sessions: Session[]) {
    sessions.forEach(s => s.liked = false);
    sessions.forEach(s => s.hidden = false);
  }

  private static compareFileNames(path1: string, path2: string): boolean {
    return path1.substr(0, path1.length - 3) === path2.substr(0, path2.length - 3);
  }

  getSessions(): Promise<Session[]> {
    return (this.cache.length ? Promise.resolve(this.cache) :
      (this.platformService.isAndroid() ? this.readFolder() :
        Promise.resolve([
          new Session({name: 'Open_The_Window_Of Your Heart - Meditation.mp3', url: '/assets/example.mp3', lyrics: true}),
          new Session({name: '1Meditation To Improve.mp3', url: '/assets/ringTones/china-bell-ring.mp3', lyrics: true}),
          new Session({name: '2Meditation To Improve.mp3', url: '/assets/ringTones/cell-phone-beep.mp3'})
        ])))
      .then(list => this.cache = list)
      .then(() => {
        SessionService.resetFlags(this.cache);
        this.setFavorites(this.cache);
        this.setHidden(this.cache);
        this.cache.sort((s1, s2) => this.sortSession(s1, s2));
        return this.cache;
      });
  }

  isAscendingOrder(): boolean {
    return this.orderAsc;
  }

  toggleOrder() {
    this.orderAsc = !this.orderAsc;
  }

  readLyrics(session: Session): Promise<string> {
    if (session.lyrics && this.platformService.isAndroid()) {
      return this.file.readAsText(this.file.externalRootDirectory + 'Download/medi', session.name.replace('.mp3', '.srt'));
    } else if (!this.platformService.isAndroid()) {
      return Promise.resolve('<h1>ŚRĪ DĪPa DAYĀL KRIPĀL MAHĀPRABHU</h1>' +
        '\n' +
        '<h2>ŚRĪ DĪPa DAYĀL KRIPĀL MAHĀPRABHU\nĀP RĀKHO LĀJ HAMĀRĪ HĒ</h2>' +
        '<b>DĪNANĀTHA ANĀTHA KE NĀTHA PRABHUJĪ\nPĀRABRAHMA AVATĀRĪ HĒ</b>\n' +
        '\n' +
        'VYĀPAKA VISVA CARĀCARA MĒ HARI\nCETANA JOT TUMHĀRĪ HĒ<p class="hun small">Vezess mineket a valótlanságból a <br/>valóságba</p>\n' +
        '\n' +
        'VYĀPAKA VISVA CARĀCARA MĒ HARI\nCETANA JOT TUMHĀRĪ HĒ\n' +
        '<p class="small">Vezess mineket a valótlanságból a valóságba</p>');
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

  private readFolder(): Promise<Session[]> {
    return this.file.listDir(this.file.externalRootDirectory, 'Download/medi')
      .then(entries => {
        const sessions = entries.filter(e => e.isFile && e.fullPath.endsWith('.mp3'))
          .map(e => {
            return new Session({name: e.name, url: e.nativeURL});
          });
        entries.filter(e => e.isFile && e.fullPath.endsWith('.srt')).forEach(e => {
          const session = sessions.find(s => SessionService.compareFileNames(s.url, e.nativeURL));
          if (!!session) {
            session.lyrics = true;
          }
        });
        return sessions;
      });
  }
}
