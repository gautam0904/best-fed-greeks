import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';


import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { AnnouncementsPage } from './announcements.page';

const routes: Routes = [
  {
    path: '',
    component: AnnouncementsPage
  }
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		ComponentsModule
	],
	declarations: [AnnouncementsPage, SafeHtmlPipe]
})
export class AnnouncementsPageModule {}
