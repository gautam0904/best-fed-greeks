import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';

import { BFGUserService } from '../../services/bfg-user.service';
import { MessageService } from '../../services/common/message.service';

@Component({
  standalone: false,
	selector: 'page-login',
	templateUrl: 'login.html',
	styleUrls: ['./login.scss'],
})
export class LoginPage {
	public login: any = { username: '', password: '' };
	public submitted = false;

	private _loader;

	constructor(
		public msg: MessageService,
		public bfgUser: BFGUserService,
		private platform: Platform,
		public router: Router
	) { }

	public ionViewDidEnter() {
		var isAuthenticated = this.bfgUser.isAuthenticated();
		if(isAuthenticated && this.bfgUser.isStudent()) {
			this.router.navigateByUrl('/dashboard');
		}
		else if(isAuthenticated && (this.bfgUser.isChef() || this.bfgUser.isSuperChef())) {
			this.router.navigateByUrl('/house-list');	
		}
	}

	public async onLogin(form: NgForm) {
		this.submitted = true;

		if (form.valid) {
			await this.msg.showLoader('Authenticating, please wait...');

			// setTimeout(async () => {
			// 	await this.msg.hideLoader();

			// 	this.bfgUser.loginMockUser();

			// 	this.router.navigateByUrl('/dashboard');
			// }, 100);

			this.bfgUser.login(this.login.username, this.login.password).subscribe(async response => {
				await this.msg.hideLoader();

				if(!response.error) {
					console.log('Full login response:', JSON.stringify(response, null, 2));
					console.log('User roles/permissions check:', {
						user_type: this.bfgUser.user?.user_type,
						role: this.bfgUser.user?.role,
						roles: this.bfgUser.user?.roles,
						permissions: this.bfgUser.user?.permissions
					});

					if(this.bfgUser.isStudent()) {
						console.log('Navigating to dashboard...');
						this.router.navigateByUrl('/dashboard');
					}
					else if(this.bfgUser.isChef() || this.bfgUser.isSuperChef()) {
						console.log('Navigating to house-list...');
						this.router.navigateByUrl('/house-list');
					}
					else {
						console.log('Unknown user type:', this.bfgUser.user?.user_type);
						this.msg.showToast('Error', 'Unable to determine access. Please contact technical support');
					}
				}
			});
		}
	}

	public onSignup() {
		this.router.navigateByUrl('/register');
	}
}
