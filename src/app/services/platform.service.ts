import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class PlatformService {
  isAndroid(): boolean {
    return !!(window as any).cordova;
  }

  convertFileSrc(src: string): string {
    return (window as any).Ionic.WebView.convertFileSrc(src);
  }
}
