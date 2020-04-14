import {Component, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {LyricsService} from '../../services/lyrics.service';

@Component({
  selector: 'app-lyrics-page',
  templateUrl: './lyrics.page.html',
  styleUrls: ['./lyrics.page.scss']
})
export class LyricsPage {

  @Input() isPausedFunction: () => boolean;
  @Input() playFunction: () => void;
  @Input() pauseFunction: () => void;
  @Input() prevFunction: () => void;
  @Input() nextFunction: () => void;
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