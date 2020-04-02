import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {NotificationService} from '../../services/notification.service';
import {ProfileService} from '../../services/profile.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-mala-page',
  templateUrl: './mala.page.html',
  animations: [
    trigger('showHide', [
      state(
        'a',
        style({
          opacity: 1,
          top: '0px'
        })
      ),
      state(
        'b',
        style({
          opacity: 0,
          top: '-250px'
        })
      ),
      transition('a <=> b', animate('150ms ease-in-out'))
    ])
  ],
  styleUrls: ['./mala.page.scss']
})
export class MalaPage {

  num = 0;
  displayFooter = 'a';

  constructor(private modalCtrl: ModalController,
              private profileService: ProfileService,
              private notificationService: NotificationService) {
  }

  reset() {
    this.num = 0;
  }

  onAnimationEvent(event) {
    if(event.toState === 'b') {
      this.displayFooter = 'a';
    }
  }

  pick() {
    this.displayFooter = 'b';
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
