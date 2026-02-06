import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGMealPlanService } from '../../services/bfg-meal-plan.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-meal-plan',
	templateUrl: './meal-plan.page.html',
	styleUrls: ['./meal-plan.page.scss'],
})
export class MealPlanPage {
	public mealPlans = [{
		day: 'Monday',
		date: 'Aug 19, 2019',
		details: [{
			late_plate: false,
			meal: 'Late Plate Lunch'
		},
		{
			late_plate: true,
			meal: 'Late Plate Dinner'
		},
		{
			late_plate: false,
			meal: 'Late Plate Brunch'
		}]
	},{
		day: 'Tuesday',
		date: 'Aug 20, 2019',
		details: [{
			late_plate: false,
			meal: 'Late Plate Lunch'
		},
		{
			late_plate: true,
			meal: 'Late Plate Dinner'
		},
		{
			late_plate: false,
			meal: 'Late Plate Brunch'
		}]
	}];

	public currentDate:any = '';
	public mealPlansLoaded: boolean = false;
	public initialLoad: boolean = false;

	private _startDate:any = '';
	private _endDate:any = '';
	private _currentDay = 'monday';

	constructor(
		private route:ActivatedRoute,
		private router:Router,
		private mealPlan: BFGMealPlanService,
		private http: HttpService,
		private msg: MessageService
	) {}

	ngOnInit() {
		if(!this.initialLoad) {
			this.setupWeekView();
		}
	}

	ionViewDidEnter() {
		if(this.initialLoad) {
			this.loadWeekView();
		}
	}

	public getStartDateFormatted() {
		return this._startDate ? this._startDate.format('MMM DD, YYYY') : '';
	}

	public getEndDateFormatted() {
		return this._endDate ? this._endDate.format('MMM DD, YYYY') : '';
	}

	public switchToPreviousWeek() {
		let date = moment(this._startDate).subtract(1, 'week');
		this.setupWeekView(date);
	}

	public switchToNextWeek() {
		let date = moment(this._startDate).add(1, 'week');
		this.setupWeekView(date);
	}

	public editMealPlan(date, mealPlanOption) {
		this.router.navigateByUrl('/edit-meal-plan', {
			state: {
				date: date,
				mealType: mealPlanOption.meal_type,
				isLatePlate: mealPlanOption.is_late_plate
			}
		});
	}

	protected syncCurrentDateWithDay() {
		let startOfWeek = moment(this._startDate);
		switch(this._currentDay) {
			case 'monday': // Nothing, monday is start of week
				
			break;
			case 'tuesday':
				startOfWeek = startOfWeek.add(1, 'days');
			break;
			case 'wednesday':
				startOfWeek = startOfWeek.add(2, 'days');
			break;
			case 'thursday':
				startOfWeek = startOfWeek.add(3, 'days');
			break;
			case 'friday':
				startOfWeek = startOfWeek.add(4, 'days');
			break;
			case 'saturday':
				startOfWeek = startOfWeek.add(5, 'days');
			break;
			case 'sunday':
				startOfWeek = startOfWeek.add(6, 'days');
			break;
		}

		this.currentDate = startOfWeek.format('YYYY-MM-DD');
	}

	protected setupWeekView(date:any='') {
		let now = moment(date ? date : new Date());
		this._startDate = moment(now).startOf('week').add(1, 'days');
		this._endDate = moment(now).endOf('week').add(1, 'days');
		this._currentDay = now.format('dddd').toLowerCase();

		this.syncCurrentDateWithDay();
		this.loadWeekView();
	}

	protected async loadWeekView() {
		await this.msg.showLoader('Loading weekly meal plans, please wait...');

		this.mealPlansLoaded = false;
		this.http.post('bfg/meals/load-weekly-meal-plans', {
			start_date: this._startDate.format('YYYY-MM-DD'),
			end_date: this._endDate.format('YYYY-MM-DD')
		}).subscribe(async response => {
			await this.msg.hideLoader();

			await this.msg.hideLoader();

			if(response.error || !response.success) {
				await this.msg.showToast('Error', response.message ? response.message : 'There was an error loading your meal plans. Please contact technical support if this persists.');
				return;
			}

			this.mealPlans = response.meal_plans;
			
			this.initialLoad = true;
			this.mealPlansLoaded = true;
		});
	}
}
