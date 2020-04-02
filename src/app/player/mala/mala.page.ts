import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-mala-page',
  templateUrl: './mala.page.html',
  styleUrls: ['./mala.page.scss']
})
export class MalaPage {

  constructor(private modalCtrl: ModalController) {
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
