import {Component, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {LyricsService} from '../../services/lyrics.service';

@Component({
  selector: 'app-lyrics-page',
  templateUrl: './lyrics.page.html',
  styleUrls: ['./lyrics.page.scss']
})
export class LyricsPage {

  @Input() hideToolbar: boolean;
  @Input() isPausedFunction: () => boolean;
  @Input() playFunction: () => void;
  @Input() pauseFunction: () => void;
  @Input() prevFunction: () => void;
  @Input() nextFunction: () => void;
  bigSize = false;
  showTranslation = false;

  constructor(private modalCtrl: ModalController,
              public lyricsService: LyricsService) {
  }

  toggleSize() {
    this.bigSize = !this.bigSize;
  }

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
  }

  close() {
    this.lyricsService.dialog = null;
    this.modalCtrl.dismiss();
  }
}
