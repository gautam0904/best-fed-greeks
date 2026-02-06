import { Component } from '@angular/core';

import { NavController } from '@ionic/angular';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

@Component({
  standalone: false,
	selector: 'app-requests',
	templateUrl: './requests.page.html',
	styleUrls: ['./requests.page.scss'],
})
export class RequestsPage {

	public data: any = { comment: '' };

	constructor(
		private http: HttpService,
		private msg: MessageService,
		private nav: NavController,
		public bfgUser: BFGUserService
	) {}

	public async save() {
		

		if(!this.data.comment) {
			await this.msg.showToast('Error', 'Please fill out a comment');
			return
		}

		await this.msg.showLoader();
		this.http.post('bfg/ratings/save-comment', {
			comment:this.data.comment
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error) {
				await this.msg.showToast('Error', response.message ? response.message : 'There was an error saving your comment. Please contact technical support if this persists.');
				return;
			}

			await this.msg.showToast('Success', 'Submitted comment successfully');
			this.data.comment = '';
			this.nav.pop();
		});
	}
}
