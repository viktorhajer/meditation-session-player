import {NotificationType} from './notification.model';

export class SettingsModel {

  constructor(public ringToneIndex = 0,
              public notificationIndex = NotificationType.RINGING,
              public repeat = 0,
              public speed = 0) {
    console.log(1);
  }
}
