import {Injectable} from '@angular/core';
import {Session} from '../models/session.model';
import {ProfileService} from './profile.service';

@Injectable({providedIn: 'root'})
export class SessionService {

  private orderAsc = true;

  constructor(private profileService: ProfileService) {
  }

  getSessions(): Promise<Session[]> {
    const list = [
      new Session({name: 'Open_The_Window_Of Your Heart - Meditation.mp3', url: '/assets/music_example.mp3'}),
      new Session({name: 'OM AKHAND - Healing Power of OM.mp3', url: '/assets/example.mp3'}),
      new Session({name: 'Meditation To Improve.mp3', url: '/assets/ringTones/china-bell-ring.mp3'}),
      new Session({name: 'OM AKHAND', url: '/assets/ringTones/cell-phone-vibrate.mp3'})
    ];
    this.setFavorites(list);
    this.setHidden(list);
    list.sort((s1, s2) => this.sortSession(s1, s2));
    return Promise.resolve(list);
  }

  isAscendingOrder(): boolean {
    return this.orderAsc;
  }

  toggleOrder() {
    this.orderAsc = !this.orderAsc;
  }

  private sortSession(s1: Session, s2: Session): number {
    if (s1.liked && s2.liked || (!s1.liked && !s2.liked)) {
      return this.sortByName(s1, s2);
    }
    return s1.liked ? -1 : 0;
  }

  private sortByName(s1: Session, s2: Session): number {
    if (this.orderAsc) {
      return s1.name.localeCompare(s2.name);
    }
    return s2.name.localeCompare(s1.name);
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
}
