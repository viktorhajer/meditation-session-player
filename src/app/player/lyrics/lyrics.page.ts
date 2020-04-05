import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {LyricsService} from '../../services/lyrics.service';

@Component({
  selector: 'app-lyrics-page',
  templateUrl: './lyrics.page.html',
  styleUrls: ['./lyrics.page.scss']
})
export class LyricsPage {

  bigSize = false;

  constructor(private modalCtrl: ModalController,
              public lyricsService: LyricsService) {
  }

  toggleSize() {
    this.bigSize = !this.bigSize;
  }

  close() {
    this.lyricsService.dialog = null;
    this.modalCtrl.dismiss();
  }
}
