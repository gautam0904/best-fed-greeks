import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-dashboard',
	templateUrl: './dashboard.page.html',
	styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
	public hasMealServiceToday = false;

	public menuDayDetails = [];
	public day = '';
	public date = '';

	public house: string = '';
	public user: string = '';

	public loaded: boolean = false;

	constructor(
		public bfgUser: BFGUserService,
		private router:Router,
		private http: HttpService,
		private msg: MessageService
	) {}

	public async ionViewDidEnter() {
		if(!this.bfgUser.isStudent()) {
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		await this.msg.showLoader();

		this.http.post('bfg/dashboard/load', { }).subscribe(async response => {
			await this.msg.hideLoader();

			this.house = response.house;
			this.user = this.bfgUser.name;
			this.hasMealServiceToday = !!response.has_meal_service_today;
			this.menuDayDetails = response.menu_day_details;
			this.day = response.day;
			this.date = response.date;

			this.loaded = true;
		});
	}

	public editMealPlan() {
		this.router.navigateByUrl('/edit-meal-plan', {
			state: {
				date: moment(new Date()).format('YYYY-MM-DD')
			}
		});
	}

	public goToWeeklyMenu() {
		this.router.navigateByUrl('/week-menu');	
	}
}
