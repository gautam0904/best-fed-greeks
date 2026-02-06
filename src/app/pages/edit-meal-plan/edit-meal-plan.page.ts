import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NavController } from '@ionic/angular';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGMealPlanService } from '../../services/bfg-meal-plan.service';
import { BFGUserService } from '../../services/bfg-user.service';

import { map } from 'rxjs/operators';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-edit-meal-plan',
	templateUrl: './edit-meal-plan.page.html',
	styleUrls: ['./edit-meal-plan.page.scss'],
})
export class EditMealPlanPage {
	public data: any = { date: '', day: '', mealPlanIdx: undefined, timeSlotSignup:'', repeat:'0', bring_guest:'0' };
	public mealPlanOptions: any = [];
	public timeSlotOptions: any = [];
	public mealPlanLoaded: boolean = false;
	public datePickerObj: any = {
		dateFormat:'MM/DD/YYYY',
		mondayFirst:true,
		closeOnSelect:true,
		titleLabel:'MM/DD/YYYY'
	};
	public enableRepeats:boolean = true;

	private _state: any = {};
	private _canBringGuest: boolean = false;

	constructor(
		private http: HttpService,
		private user: BFGUserService,
		private mealPlans: BFGMealPlanService,
		private msg: MessageService,
		public router: Router,
		private nav: NavController,
	) {
		console.log(this.router.getCurrentNavigation());
		let extras = this.router.getCurrentNavigation().extras;
		this._state = extras && extras.state ? extras.state : {};
	}

	public async ionViewDidEnter() {
		let state = this._state;

		this.data.date = state && state.date ? moment(state.date).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY');
		this.data.day = moment(this.data.date).format('dddd').toLowerCase();
	}

	public async mealDateChanged() {
		await this.msg.showLoader('Loading meal types, please wait...');

		let dayOfWeekFromDay = '';

		if(this.data.repeat == '0') {
			this.data.day = moment(this.data.date).format('dddd').toLowerCase();
		}

		this.mealPlanLoaded = false;
		this.mealPlans.loadAvailableMealPlanOptionsFromDay(
			this.data.day
		).subscribe(async mealPlanOptions => {
			await this.msg.hideLoader();

			this.enableRepeats = mealPlanOptions.enable_meal_repeats;
			this.mealPlanOptions = mealPlanOptions.options;
			this.mealPlanLoaded = true;

			// Reset
			if(this.data.mealPlanIdx !== undefined && this.data.mealPlanIdx >= this.mealPlanOptions.length) {
				this.data.mealPlanIdx = undefined
			}
		});
	}

	public async mealTypeChanged() {
		let timeSlotsEnabled = false;
		let mealPlanOption = {} as any;
		if(this.data.mealPlanIdx !== undefined && this.data.mealPlanIdx !== null && this.mealPlanOptions[this.data.mealPlanIdx]) {
			mealPlanOption = this.mealPlanOptions[this.data.mealPlanIdx];

			if(mealPlanOption.time_slots_enabled) {
				timeSlotsEnabled = mealPlanOption.time_slots_enabled;
			}
		}

		this.data.timeSlotSignup = '';
		this.timeSlotOptions = [];
		if(!timeSlotsEnabled) {
			return;
		}

		await this.msg.showLoader('Loading time slots, please wait...');

		let dayOfWeekFromDay = '';

		let date = '';
		if(this.data.repeat == '1') {
			date = this.getDateFromDay(this.data.day);
		}
		else {
			date = this.data.date;
		}

		this.mealPlans.loadTimeSlotsForDate(
			date,
			mealPlanOption.meal_type
		).subscribe(async timeSlots => {
			await this.msg.hideLoader();

			this.timeSlotOptions = timeSlots;
		});
	}

	protected getDateFromDay(day:string) {
		return moment().day(this.data.day).format('YYYY-MM-DD');
	}

	public get canBringGuest() {
		return this.data.mealPlanIdx && this.mealPlanOptions && this.mealPlanOptions[this.data.mealPlanIdx].can_bring_guest;
	}

	public async save() {
		if(this.data.mealPlanIdx === undefined) {
			this.msg.showToast('Error', 'Please select a meal type');
			return;
		}

		let mealPlan = this.mealPlanOptions[this.data.mealPlanIdx];

		if(mealPlan.time_slots_enabled && !this.data.timeSlotSignup) {
			this.msg.showToast('Error', 'Please select a time slot');
			return;
		}

		await this.msg.showLoader('Saving meal plan, please wait...');

		this.http.post('bfg/meals/save-meal-plan', {
			meal_type: mealPlan.meal_type,
			late_plate: mealPlan.late_plate ? 1 : 0,
			meal_date: parseInt(this.data.repeat) ? this.getDateFromDay(this.data.day) : moment(this.data.date).format('YYYY-MM-DD'),
			meal_day: this.data.day,
			time_slot_signup: this.data.timeSlotSignup,
			repeat: parseInt(this.data.repeat),
			bring_guest: parseInt(this.data.bring_guest)
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error || !response.success) {
				await this.msg.showToast('Error', response.message ? response.message : 'There was an error saving your meal plan. Please contact technical support if this persists.', 10000);
				return;
			}

			await this.msg.showToast('Success', 'Thanks for entering your meal plan!');

			this._canBringGuest = false;
			this.data = { date: '', day: '', mealPlanIdx: undefined, repeat:'0', bring_guest:'0' };
			this.ionViewDidEnter();
			this.mealPlanLoaded = false;

			this.nav.pop();
		});
	}
}
