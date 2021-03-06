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
    public notificationType = NotificationType.RINGING_AND_VIBRATION,
    public timerEnabled = false,
    public timerRepeated = false,
    public timerPeriods = [60],
    public timerAfterAction = 0,
    public musicEnabled = false,
    public musicUrl = '',
    public musicVolume = 50,
    public restartMusic = false,
    public repeat = 0,
    public themeIndex = 2,
    public profileToolbarEnabled = false,
    public malaEnabled = false,
    public malaBeads = 108,
    public hidden: string[] = [],
    public favorites: string[] = []) {
  }
}
