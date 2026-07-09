import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TechnicalSupportPage } from './technical-support.page';

const routes: Routes = [
  {
    path: '',
    component: TechnicalSupportPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TechnicalSupportPage]
})
export class TechnicalSupportPageModule {}
