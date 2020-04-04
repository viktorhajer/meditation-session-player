import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SessionService} from '../../services/session.service';

@Component({
  selector: 'app-lyrics-page',
  templateUrl: './lyrics.page.html',
  styleUrls: ['./lyrics.page.scss']
})
export class LyricsPage {

  constructor(private modalCtrl: ModalController,
              private sessionService: SessionService) {
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
