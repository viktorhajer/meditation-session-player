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
        'b0',
        style({
          opacity: 1,
          top: '0px',
          width: '200px',
          height: '200px',
          filter: 'blur(0px)'
        })
      ),
      state(
        'b1',
        style({
          opacity: 0,
          top: '-250px',
          width: '100px',
          height: '100px',
          filter: 'blur(8px)'
        })
      ),
      state(
        'b2',
        style({
          opacity: 1,
          top: '100px',
          filter: 'blur(3px)'
        })
      ),
      state(
        'b3',
        style({
          opacity: 0,
          top: '0px',
          width: '600px',
          height: '600px',
          filter: 'blur(15px)'
        })
      ),
      transition('b0 => b1', animate('150ms ease-in')),
      transition('b1 => b2', animate('150ms ease-out')),
      transition('b2 => b0', animate('150ms ease-out')),
      transition('b0 <=> b3', animate('100ms ease-out'))
    ])
  ],
  styleUrls: ['./mala.page.scss']
})
export class MalaPage {

  num = 0;
  ballAnim = 'b0';

  constructor(private modalCtrl: ModalController,
              private profileService: ProfileService,
              private notificationService: NotificationService) {
  }

  reset() {
    this.num = 0;
  }

  onAnimationEvent(event) {
    if (event.toState === 'b1') {
      this.ballAnim = 'b2';
    }
    if (event.toState === 'b2' || event.toState === 'b3') {
      this.ballAnim = 'b0';
    }
  }

  pick() {
    this.num++;
    if (this.num === this.profileService.profile.malaBeads) {
      this.ballAnim = 'b3';
      this.num = 0;
      this.notificationService.ring(true);
    } else {
      this.ballAnim = 'b1';
      this.notificationService.vibrateNotification(true, [100]);
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
