import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {PlayerPage} from './player.page';
import {SettingsPage} from './settings/settings.page';
import {MalaPage} from './mala/mala.page';
import {LyricsPage} from './lyrics/lyrics.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlayerPage
      }
    ])
  ],
  declarations: [PlayerPage, SettingsPage, MalaPage, LyricsPage],
  entryComponents: [SettingsPage, MalaPage, LyricsPage]
})
export class PlayerModule {
}
