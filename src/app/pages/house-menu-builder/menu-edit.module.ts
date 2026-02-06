import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';

import { MenuEditPage } from './menu-edit.page';

const routes: Routes = [
  {
    path: '',
    component: MenuEditPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    NgSelectModule
  ],
  declarations: [MenuEditPage]
})
export class MenuEditModule {}
