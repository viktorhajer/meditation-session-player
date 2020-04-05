import {Component, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-lyrics-page',
  templateUrl: './lyrics.page.html',
  styleUrls: ['./lyrics.page.scss']
})
export class LyricsPage {

  @Input() content: string;

  constructor(private modalCtrl: ModalController) {
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
