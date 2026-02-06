import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-announcements',
	templateUrl: './announcements.page.html',
	styleUrls: ['./announcements.page.scss'],
})
export class AnnouncementsPage {
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
			this.msg.showToast('Error', 'Oops. We had trouble loading the announcements.');
			return;
		}

		await this.msg.showLoader();

		this.http.post('bfg/house-dashboard/load-announcements', { }).subscribe(async response => {
			await this.msg.hideLoader();

			this.announcements = response.announcements;
			this.user = this.bfgUser.name

			this.loaded = true;
		});
	}
}
