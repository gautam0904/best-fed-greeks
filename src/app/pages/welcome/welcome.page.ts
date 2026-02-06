import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
import { BFGUserService } from '../../services/bfg-user.service';

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.page.html',
	styleUrls: ['./welcome.page.scss'],
	standalone: false
})
export class WelcomePage {

	constructor(
		public bfgUser: BFGUserService,
		private platform: Platform,
		public router: Router
	) { }

	public ionViewDidEnter() {
		this.platform.backButton.subscribeWithPriority(9999, () => {
			// Do nothing
		});

		document.addEventListener("backbutton", function (e) {
			e.preventDefault();
		}, false);

		if (this.bfgUser.isAuthenticated() && this.bfgUser.isStudent()) {
			this.router.navigateByUrl('/dashboard');
		}
		else if (this.bfgUser.isChef() || this.bfgUser.isSuperChef()) {
			this.router.navigateByUrl('/house-list');
		}
	}
}
