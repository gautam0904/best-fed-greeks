import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-house-menus',
	templateUrl: './house-menus.page.html',
	styleUrls: ['./house-menus.page.scss'],
})
export class HouseMenusPage {
	public houses = [];
	public houseLocations = [];
	public housesKeyedMenu = {};
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
		if(!this.bfgUser.isSuperChef()) {
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the house menus.');
			return;
		}

		await this.msg.showLoader();

		this.bfgUser.initializeHouses().subscribe(async myResonse => {
			this.http.post('bfg/house-menus/load-summary', { }).subscribe(async response => {
				var me = this;

				await this.msg.hideLoader();

				this.houses = response.houses;
				this.houses.forEach(function(house) {
					me.housesKeyedMenu[house.id] = house;
				});
				this.houseLocations = response.houseLocations;
				this.user = this.bfgUser.name;

				this.loaded = true;
			});
		})
	}
}
