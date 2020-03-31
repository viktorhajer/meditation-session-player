import {Injectable} from '@angular/core';
import {Session} from '../models/session.model';

@Injectable({providedIn: 'root'})
export class SessionService {

  getSessions(): Promise<Session[]> {
    return Promise.resolve([
      {name: 'Open The Window Of Your Heart - Meditation.mp3', url: 'ringTones/china-bell-ring.mp3'},
      {name: 'OM AKHAND - Healing Power of OM.mp3', url: 'ringTones/china-bell-ring.mp3'},
      {name: 'Meditation To Release Inner Tension.mpg3', url: 'ringTones/china-bell-ring.mp3'}
    ]);
  }
}
