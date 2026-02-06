import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

import { BFGUserService } from '../../services/bfg-user.service';

@Component({
  standalone: false,
	selector: 'page-register',
	templateUrl: 'register.html',
	styleUrls: ['./register.scss'],
})
export class RegisterPage {
	register: any = { name: '', email:'', password: '', password_confirmation:'', access_code:'' };
	submitted = false;

	private _loader;

	constructor(
		public toast: ToastController,
		public loader: LoadingController,
		public router: Router,
		public bfgUser: BFGUserService
	) {}

	public async onRegister(form: NgForm) {
		this.submitted = true;

		if (form.valid) {
			this._loader = await this.loader.create({
				message: 'Registering, please wait...'
			});
			await this._loader.present();

			this.bfgUser.register(this.register).subscribe(async response => {
				let header = '',
					message = '',
					redirectTo = '';

				if(response.success) {
					header = 'Success';
					message = response.message ? response.message : 'Check your email for activation link';
					redirectTo = 'welcome';
				}
				else {
					header = response.header ? response.header : 'Error';
					message = response.message ? response.message : 'There was an error while registering. Please try again';
				}

				await this._loader.dismiss();

				let toast = await this.toast.create({
					header:header,
					message: message,
					position:'bottom',
					duration:5000,
					buttons: [{
						text: 'Close',
						role: 'cancel'
			        }]
				});
				await toast.present();

				if(redirectTo) {
					this.register = { name: '', email:'', password: '', password_confirmation:'', access_code:'' };
					this.router.navigateByUrl(redirectTo);
				}
			});
		}
	}
}
