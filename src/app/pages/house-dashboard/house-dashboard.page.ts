import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-house-dashboard',
	templateUrl: './house-dashboard.page.html',
	styleUrls: ['./house-dashboard.page.scss'],
})
export class HouseDashboardPage {
	public hasMealServiceToday = false;

	public menuDayDetails = [];
	public day = '';
	public date = '';

	public house: any = {};
	public user: string = '';

	public loaded: boolean = false;

	private _houseId: number = 0;

	constructor(
		public bfgUser: BFGUserService,
		private router:Router,
		private route: ActivatedRoute,
		private http: HttpService,
		private msg: MessageService
	) {}

	ngOnInit() {
		this.route.params.subscribe( params => {
			this._houseId = parseInt(params['houseId']);
		});
	}

	public backToHouseList() {
		this.router.navigateByUrl('/house-list');
	}

	public async ionViewDidEnter() {
		if(!this.bfgUser.isSuperChef() && !this.bfgUser.isChef()) {
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		if(this._houseId) {
			this.loadHouseInformation(this._houseId);
		}
	}

	public goToWeeklyMenu() {
		this.router.navigate(['/week-menu', this.house.id]);
	}

	public houseRoster() {
		this.router.navigate(['/house-roster', this.house.id]);	
	}

	public houseChat() {
		this.router.navigate(['/chat', this.house.id]);	
	}
	
	public houseMenuBuilder() {
		this.router.navigate(['/house-menu-builder/list/', this.house.id]);
	}

	protected async loadHouseInformation(houseId) {
		await this.msg.showLoader();

		this._houseId = houseId;

		this.bfgUser.initializeHouses().subscribe(async myResponse => {
			this.bfgUser.switchToHouse(houseId);

			this.http.post('bfg/house-dashboard/load', {
				bfg_house_id: houseId
			}).subscribe(async response => {
				await this.msg.hideLoader();

				this.house = response.house;
				this.user = this.bfgUser.name;
				this.hasMealServiceToday = !!response.has_meal_service_today;
				this.menuDayDetails = response.menu_day_details;
				this.day = response.day;
				this.date = response.date;

				this.loaded = true;
			});
		});
	}
}
