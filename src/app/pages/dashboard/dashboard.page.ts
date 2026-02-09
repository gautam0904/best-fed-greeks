import { Component, ChangeDetectorRef } from '@angular/core';
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
		private msg: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	public async ionViewDidEnter() {
		console.log('DashboardPage: ionViewDidEnter triggered');
		if(!this.bfgUser.isStudent()) {
			console.log('DashboardPage: User is not student, redirecting to login');
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		console.log('DashboardPage: Showing loader and fetching data...');
		await this.msg.showLoader();

		this.http.post('bfg/dashboard/load', { }).subscribe({
			next: async (response) => {
				console.log('DashboardPage: Data received', response);
				await this.msg.hideLoader();

				if (response) {
					this.house = response.house;
					this.user = this.bfgUser.name;
					this.hasMealServiceToday = !!response.has_meal_service_today;
					this.menuDayDetails = response.menu_day_details;
					this.day = response.day;
					this.date = response.date;

					this.loaded = true;
					console.log('DashboardPage: loaded set to true');
					this.cdr.detectChanges(); 
				} else {
					console.warn('DashboardPage: Empty response received');
					this.msg.showToast('Error', 'Received empty response from server.');
				}
			},
			error: async (error) => {
				console.error('DashboardPage: Error loading dashboard', error);
				await this.msg.hideLoader();
				this.msg.showToast('Error', 'Unable to load dashboard. Please check your connection.');
			}
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
