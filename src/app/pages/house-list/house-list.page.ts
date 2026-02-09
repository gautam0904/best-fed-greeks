import { Component, ChangeDetectorRef } from '@angular/core';
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
		private msg: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	public async ionViewDidEnter() {
		console.log('HouseListPage: ionViewDidEnter triggered');
		if(!this.bfgUser.isSuperChef() && !this.bfgUser.isChef()) {
			console.log('HouseListPage: User is not chef, redirecting to login');
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		console.log('HouseListPage: Showing loader and initializing houses...');
		await this.msg.showLoader();

		this.bfgUser.initializeHouses().subscribe({
			next: async (response) => {
				console.log('HouseListPage: initializeHouses response received');
				
				if (this.bfgUser.houses.length === 0) {
					console.warn('HouseListPage: No houses found, attempting to fetch user config...');
					this.bfgUser.fetchUserConfig().subscribe({
						next: async (configResponse) => {
							console.log('HouseListPage: User config fetched', configResponse);
							this.updateHouseData();
							await this.msg.hideLoader();
						},
						error: async (err) => {
							console.error('HouseListPage: Error fetching user config', err);
							await this.msg.hideLoader();
							this.msg.showToast('Error', 'Unable to load houses. Please check your connection.');
							this.loaded = true;
							this.cdr.detectChanges();
						}
					});
				} else {
					this.updateHouseData();
					await this.msg.hideLoader();
				}
			},
			error: async (error) => {
				console.error('HouseListPage: Error initializing houses', error);
				await this.msg.hideLoader();
				this.msg.showToast('Error', 'Unable to load houses.');
				this.loaded = true;
				this.cdr.detectChanges();
			}
		});
	}

	private updateHouseData() {
		this.houses = this.bfgUser.houses;
		this.houseLocations = this.bfgUser.houseLocations;
		this.user = this.bfgUser.name;

		console.log('HouseListPage: House data updated', { 
			houses: this.houses.length, 
			locations: this.houseLocations.length 
		});

		if(this.houses && this.houses.length == 1) {
			console.log('HouseListPage: Single house found, redirecting...');
			this.goToHouse(this.houses[0].id);
		}

		this.loaded = true;
		this.cdr.detectChanges();
	}

	public goToHouse(houseId) {
		this.bfgUser.switchToHouse(houseId);
		this.router.navigateByUrl('/house-dashboard/' + houseId);
	}
}
