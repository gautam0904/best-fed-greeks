import { Injectable } from '@angular/core';

import { LoadingController, ToastController } from '@ionic/angular';

import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class MessageService {
	private _loader;

	constructor(
		private loader: LoadingController,
		private toast: ToastController 
	) {}

	public async showLoader(message:string='Loading, please wait...') {
		if(this._loader) {
			await this._loader.dismiss();
		}

		this._loader = await this.loader.create({
			message: message
		});
		await this._loader.present();
	}

	public async hideLoader() {
		if(this._loader) {
			await this._loader.dismiss();
		}
	}

	// Implement when needed
	public async showToast(header, message, duration=5000) {
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
	}
}
