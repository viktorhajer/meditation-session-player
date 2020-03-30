import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {PlayerPage} from './player.page';
import {SettingsPage} from './components/settings.page';

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
  declarations: [PlayerPage, SettingsPage],
  entryComponents: [SettingsPage]
})
export class PlayerModule {
}
