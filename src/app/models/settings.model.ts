import {NotificationType} from './notification.model';

export class SettingsModel {

  constructor(public ringToneIndex = 0,
              public notificationEnabled = false,
              public notificationType = NotificationType.RINGING,
              public timerEnabled = false,
              public timerInterval = [8],
              public musicEnabled = false,
              public musicIndex = 0,
              public musicVolume = 50,
              public restartMusic = false,
              public repeat = 0,
              public speed = 0,
              public themeIndex = 0) {
  }
}
