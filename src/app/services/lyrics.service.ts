import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class LyricsService {
  title = '';
  content = '';
  dialog: HTMLIonModalElement;

  closeDialog() {
    if (!!this.dialog) {
      this.dialog.dismiss();
    }
  }
}
