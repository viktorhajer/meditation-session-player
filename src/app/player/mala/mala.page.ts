import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {NotificationService} from '../../services/notification.service';
import {ProfileService} from '../../services/profile.service';

@Component({
  selector: 'app-mala-page',
  templateUrl: './mala.page.html',
  styleUrls: ['./mala.page.scss']
})
export class MalaPage {

  num = 0;

  constructor(private modalCtrl: ModalController,
              private profileService: ProfileService,
              private notificationService: NotificationService) {
  }

  reset() {
    this.num = 0;
  }

  pick() {
    this.num++;
    if (this.num === this.profileService.profile.malaBeads) {
      this.num = 0;
      this.notificationService.ring(true);
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
