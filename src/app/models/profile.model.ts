import {NotificationType} from './notification.model';

export const DEFAULT_PROFILE_NAME = 'Default';

export interface ProfilesModel {
  profiles: ProfileModel[];
}

export class ProfileModel {
  constructor(
    public selected = false,
    public name = DEFAULT_PROFILE_NAME,
    public ringToneIndex = 0,
    public notificationEnabled = false,
    public notificationType = NotificationType.RINGING,
    public timerEnabled = false,
    public timerRepeated = false,
    public timerPeriods = [60],
    public musicEnabled = false,
    public musicUrl = '',
    public musicVolume = 50,
    public restartMusic = false,
    public repeat = 0,
    public speed = 0,
    public themeIndex = 2,
    public malaEnabled = false,
    public malaBeads = 108,
    public hidden: string[] = [],
    public favorites: string[] = []) {
  }
}
