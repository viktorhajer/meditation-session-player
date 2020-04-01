import {NotificationType} from './notification.model';

export interface ProfilesModel {
  profiles: ProfileModel[];
}

export class ProfileModel {
  constructor(
    public selected = false,
    public name = 'Default',
    public ringToneIndex = 0,
    public notificationEnabled = false,
    public notificationType = NotificationType.RINGING,
    public timerEnabled = false,
    public timerInterval = [480],
    public musicEnabled = false,
    public musicIndex = 0,
    public musicVolume = 50,
    public restartMusic = false,
    public repeat = 0,
    public speed = 0,
    public themeIndex = 2,
    public favorites: number[] = []) {
  }
}
