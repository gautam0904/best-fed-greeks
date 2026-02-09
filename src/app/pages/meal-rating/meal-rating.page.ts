import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { NavController } from '@ionic/angular';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';
import { BFGMealPlanService } from '../../services/bfg-meal-plan.service';

import moment from 'moment';

@Component({
	standalone: false,
	selector: 'app-meal-rating',
	templateUrl: './meal-rating.page.html',
	styleUrls: ['./meal-rating.page.scss'],
})
export class MealRatingPage {
	public data: any = { date: '', feedback: '', rating: '' };
	public day: string = '';
	public mealTypes: any = [];
	public mealType: string = '';
	public menuDayDetails: any = [];
	public menuDayDetailsLoaded: boolean = false;
	public hasMealServiceForDay: boolean = false;
	public datePickerObj: any = {
		dateFormat: 'MM/DD/YYYY',
		mondayFirst: true,
		closeOnSelect: true,
		titleLabel: 'MM/DD/YYYY'
	};


	private _mealTypeFromExtra = '';
	private _state: any = {};

	constructor(
		private nav: NavController,
		private mealPlans: BFGMealPlanService,
		private http: HttpService,
		private msg: MessageService,
		public router: Router,
		private cdr: ChangeDetectorRef
	) {
		console.log(this.router.getCurrentNavigation());
		let extras = this.router.getCurrentNavigation().extras;
		this._state = extras && extras.state ? extras.state : {};
	}

	public async ionViewDidEnter() {
		let state = this._state;

		this._mealTypeFromExtra = state && state.mealType ? state.mealType.charAt(0).toUpperCase() + state.mealType.slice(1) : '';
		this.data.date = state && state.date ? moment(state.date).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY');
		this.data.rating = '';
		this.data.feedback = '';
	}

	public async mealDateChanged() {
		await this.msg.showLoader('Loading meal types, please wait...');

		this.mealType = '';
		this.day = moment(this.data.date).format('dddd');
		this.mealPlans.loadAvailableMealTypes(
			moment(this.data.date).format('YYYY-MM-DD')
		).subscribe(async mealTypes => {
			await this.msg.hideLoader();

			this.mealTypes = mealTypes && mealTypes.length ? mealTypes : mealTypes;

			if (this._mealTypeFromExtra) {
				this.mealTypes = this.mealTypes.filter((mealType) => { return mealType == this._mealTypeFromExtra; });
				this.mealType = this._mealTypeFromExtra;
				this._mealTypeFromExtra;
			}
			else if (this.mealTypes.length > 0) {
				this.mealType = this.mealTypes[0];
			}
			this.cdr.detectChanges();
		});
	}

	public async mealTypeChanged() {
		if (!this.data.date || !this.mealType) return;

		await this.msg.showLoader('Loading meal for that day, please wait...');
		this.http.post('bfg/meals/load-day-meal', {
			date: moment(this.data.date).format('YYYY-MM-DD'),
			meal_type: this.mealType
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if (response.error || !response.success) {
				await this.msg.showToast('Error', response.message ? response.message : 'The meal for this day could not be loaded. Please try another day.', 10000);
				return;
			}

			this.menuDayDetails = response.menu_day_details;
			this.hasMealServiceForDay = response.has_meal_service;
			this.menuDayDetailsLoaded = true;
			this.cdr.detectChanges();
		});
	}

	public async save() {
		if (!this.data.rating) {
			this.msg.showToast('Error', 'Please select a rating');
			return;
		}

		if (!this.hasMealServiceForDay) {
			this.msg.showToast('Error', 'No meal service for that day so cannot rate meal');
			return;
		}

		if (!this.data.feedback) {
			this.msg.showToast('Error', 'Please provide feedback');
			return;
		}

		await this.msg.showLoader('Saving meal rating, please wait...');

		this.http.post('bfg/ratings/save-meal-rating', {
			meal_type: this.mealType,
			meal_date: moment(this.data.date).format('YYYY-MM-DD'),
			feedback: this.data.feedback,
			rating: this.data.rating
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if (response.error) {
				await this.msg.showToast('Error', response.message ? response.message : 'There was an error saving your meal rating. Please contact technical support if this persists.');
				return;
			}

			await this.msg.showToast('Success', 'Thanks for rating your meal! We value your feedback.');

			this.nav.pop();
		});
	}

}
