import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AutosizeModule } from 'ngx-autosize';

import { ChatPage } from './chat.page';
import { ChatInteractionsPage } from './chat-interactions.page';

const routes: Routes = [
  {
    path: '',
    component: ChatPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AutosizeModule
  ],
  entryComponents: [ChatInteractionsPage],
  declarations: [ChatPage, ChatInteractionsPage]
})
export class ChatPageModule {}
