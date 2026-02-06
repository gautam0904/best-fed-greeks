import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-house-list',
	templateUrl: './house-list.page.html',
	styleUrls: ['./house-list.page.scss'],
})
export class HouseListPage {
	public houses = [];
	public houseLocations = [];
	public subscribedToChat = {};
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
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		await this.msg.showLoader();

		this.bfgUser.initializeHouses().subscribe(async response => {
			await this.msg.hideLoader();

			this.houses = this.bfgUser.houses;
			this.houseLocations = this.bfgUser.houseLocations;
			this.user = this.bfgUser.name;

			if(this.houses && this.houses.length == 1) {
				this.goToHouse(this.houses[0].id);
			}

			this.loaded = true;
		});
	}

	public goToHouse(houseId) {
		this.bfgUser.switchToHouse(houseId);
		this.router.navigateByUrl('/house-dashboard/' + houseId);
	}
}
