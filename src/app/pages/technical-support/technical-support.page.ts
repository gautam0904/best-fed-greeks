import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

@Component({
  standalone: false,
	selector: 'app-technical-support',
	templateUrl: './technical-support.page.html',
	styleUrls: ['./technical-support.page.scss'],
})
export class TechnicalSupportPage {

	public submitted = false;
	public data: any = { name: '', email: '', houseName: '', collegeName: '', comment: '' };

	constructor(
		private nav: NavController,
		private http: HttpService,
		private msg: MessageService,
		public bfgUser: BFGUserService
	) { }

	async ionViewDidEnter() {
		this.submitted = false;
		let user = this.bfgUser.user;
		if(user) {
			await this.msg.showLoader();
			this.http.post('bfg/user/load-technical-support-info', {}).subscribe(async response => {
				await this.msg.hideLoader();

				if(response.error) {
					this.msg.showToast('Error', response.message ? response.message : 'Error loading information for technical support information');
					return;
				}

				this.data.name = response.name;
				this.data.email = response.email;
				this.data.houseName = response.house;
				this.data.collegeName = response.college;
			});
		}
	}

	public async save() {
		if(!this.data.name || !this.data.email || !this.data.houseName || !this.data.collegeName || !this.data.comment) {
			this.msg.showToast('Error', 'Please make sure to fill out all fields.');
			return;
		}

		await this.msg.showLoader('Submitting, please wait...');
		this.http.post('bfg/user/save-technical-support-info', this.data).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error) {
				this.msg.showToast('Error', response.message ? response.message : 'Error saving technical support, if this persists please contact us at support@rahadigital.com');
				return;
			}

			this.data = { name: '', email: '', houseName: '', collegeName: '', comment: '' };
			this.submitted = true;
		});
	}
}
