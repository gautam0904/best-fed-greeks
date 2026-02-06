import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

@Component({
  standalone: false,
	selector: 'app-password-reset',
	templateUrl: './password-reset.page.html',
	styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {

	public data: any = { email: '' };

	constructor(
		private router: Router,
		private http: HttpService,
		private msg: MessageService,
		public bfgUser: BFGUserService
	) { }

	ngOnInit() {
	}
	
	public async save() {
		if(!this.data.email) {
			this.msg.showToast('Error', 'Please provide an email');
			return;
		}

		await this.msg.showLoader('Submitting, please wait...');
		this.http.post('auth/forgot-password', this.data).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error) {
				if(response.status == 404) {
					this.msg.showToast('Error', 'Did not find a user by that email');
				}
				return;
			}

			this.msg.showToast('Success', 'Please check your email and follow the instructions to reset your password.');
			this.router.navigateByUrl('/login');
		});
	}
}
