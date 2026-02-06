import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-chat-list',
	templateUrl: './chat-list.page.html',
	styleUrls: ['./chat-list.page.scss'],
})
export class ChatListPage {
	public chatList: any = [];

	public announcements:string = '';
	public user: any = '';
	public loaded: boolean = false;

	constructor(
		public bfgUser: BFGUserService,
		private router:Router,
		private http: HttpService,
		private msg: MessageService
	) {}

	public async ionViewDidEnter() {
		if(!this.bfgUser.isSuperChef() && !this.bfgUser.isChef()) {
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the chat list.');
			return;
		}

		await this.msg.showLoader();

		this.http.post('bfg/chat/load-list', { }).subscribe(async response => {
			await this.msg.hideLoader();

			this.chatList = response.chat_list;

			this.loaded = true;
		});
	}

}
