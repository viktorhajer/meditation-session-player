import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings.page.html'
})
export class SettingsPage {

  constructor(private modalCtrl: ModalController) {
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}