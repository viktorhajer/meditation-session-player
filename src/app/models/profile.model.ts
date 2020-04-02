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
    public timerInterval = [480],
    public musicEnabled = false,
    public musicIndex = 0,
    public musicVolume = 50,
    public restartMusic = false,
    public repeat = 0,
    public speed = 0,
    public themeIndex = 2,
    public malaEnabled = false,
    public malaBeads = 108,
    public hidden: number[] = [],
    public favorites: number[] = []) {
  }
}
