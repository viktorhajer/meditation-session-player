import {Injectable} from '@angular/core';
import {Session} from '../models/session.model';
import {SettingsService} from './settings.service';

@Injectable({providedIn: 'root'})
export class SessionService {

  private orderAsc = true;

  constructor(private settingsService: SettingsService) {
  }

  getSessions(): Promise<Session[]> {
    const list = [
      new Session({id: 0, name: 'Open_The_Window_Of Your Heart - Meditation.mp3', url: 'music_example.mp3', duration: '12:05'}),
      new Session({id: 1, name: 'OM AKHAND - Healing Power of OM.mp3', url: 'example.mp3', duration: '01:00'}),
      new Session({id: 2, name: 'Meditation To Release Inner Tension.mp3', url: 'music_example.mp3', duration: '19:48'}),
      new Session({id: 3, name: 'Meditation To Improve.mp3', url: 'ringTones/china-bell-ring.mp3', duration: '10:50'}),
      new Session({id: 4, name: 'OM AKHAND', url: 'ringTones/china-bell-ring.mp3', duration: '05:06'})
    ];
    this.setFavorites(list);
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
    const favorites = this.settingsService.profile.favorites;
    sessions.forEach(s => {
      s.liked = favorites.some(id => id === s.id);
    });
  }
}
