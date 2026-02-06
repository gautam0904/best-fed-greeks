import { Injectable } from '@angular/core';
import { HttpService } from './common/http.service';
import { MessageService } from './common/message.service';

import { Observable } from 'rxjs';
import moment from 'moment';

@Injectable({
	providedIn: 'root',
})
export class BFGMealPlanService {
	private _mealPlanAvailabilityConfig: any;
	private _enable_meal_repeats:boolean = false;

	constructor(
		private http: HttpService,
		private msg: MessageService
	) {}

	public loadAvailableMealTypes(date:string): Observable<any> {
		return new Observable((observer) => {
			if(!this._mealPlanAvailabilityConfig) {
				this.loadMealAvailabilityConfig().subscribe((mealAvailabiltiyConfig) => {
					observer.next(this.getAvailableMealTypes(date));
					observer.complete();
				});
			}
			else {
				observer.next(this.getAvailableMealTypes(date));
				observer.complete();
			}

			return () => {};
		});
	}

	public loadAvailableMealPlanOptionsFromDay(day:string): Observable<any> {
		return new Observable((observer) => {
			if(!this._mealPlanAvailabilityConfig) {
				this.loadMealAvailabilityConfig().subscribe((mealAvailabiltiyConfig) => {
					observer.next({
						enable_meal_repeats: this._enable_meal_repeats,
						options:this.getAvailableMealPlanOptions(day.toLowerCase())
					});
					observer.complete();
				});
			}
			else {
				observer.next({
					enable_meal_repeats: this._enable_meal_repeats,
					options:this.getAvailableMealPlanOptions(day.toLowerCase())
				});
				observer.complete();
			}

			return () => {};
		});
	}

	public loadTimeSlotsForDate(date:string, mealType:string): Observable<any> {
		return new Observable((observer) => {
			this.http.post('bfg/meals/load-meal-plan-time-slots', {
				date: date,
				meal_type: mealType
			}).subscribe(async response => {
				let timeSlots = response.time_slots;

				if(!timeSlots || timeSlots.length == 0) {
					await this.msg.showToast('Error', 'Unable to load time slots. If this persists please contact technical support');
					await this.msg.hideLoader();
					observer.error('No time slots found');
					return;
				}

				observer.next(timeSlots);
				observer.complete();
			});

			return () => {};
		});
	}

	protected getAvailableMealTypes(date:string) {
		let availableTypes = [],
			dayOfWeek = moment(date).format('dddd').toLowerCase(),
			dayOfWeekConfig = this._mealPlanAvailabilityConfig[dayOfWeek];

		if(dayOfWeekConfig) {
			availableTypes = Object.keys(dayOfWeekConfig);
		}

		return availableTypes;
	}

	protected getAvailableMealPlanOptions(dayOfWeek:string) {
		let availableTypes = [],
			availableOptions = [],
			dayOfWeekConfig = this._mealPlanAvailabilityConfig[dayOfWeek];

		if(dayOfWeekConfig) {
			availableTypes = Object.keys(dayOfWeekConfig);
			availableTypes.forEach((val) => {
				let config = dayOfWeekConfig[val];

				if(config.require_signup) {
					availableOptions.push({
						meal_type:val,
						display:"I'll Be At " + val,
						late_plate:false,
						time_slots_enabled: config.has_signup_slots,
						can_bring_guest:config.can_bring_guest
					});
				}

				if(config.has_late_plate) {
					availableOptions.push({
						meal_type:val,
						display:"Late Plate " + val,
						late_plate:true,
						can_bring_guest:config.can_bring_guest
					});
				}
			});
		}

		return availableOptions;
	}

	protected loadMealAvailabilityConfig(): Observable<any> {
		return new Observable((observer) => {
			if(this._mealPlanAvailabilityConfig) {
				observer.next({
					enable_meal_repeats: this._enable_meal_repeats,
					options:this._mealPlanAvailabilityConfig
				});
				observer.complete();
			}
			else {
				this.http.post('bfg/meals/load-meal-plan-availability', {}).subscribe(async response => {
					this._mealPlanAvailabilityConfig = response.meal_plan_availability_config;
					this._enable_meal_repeats = response.enable_meal_repeats;

					if(!this._mealPlanAvailabilityConfig) {
						await this.msg.showToast('Error', 'Unable to load meal plan availability. If this persists please contact technical support');
						await this.msg.hideLoader();
						observer.error('No meal plan availability found');
						return;
					}

					observer.next({
						enable_meal_repeats: this._enable_meal_repeats,
						options:this._mealPlanAvailabilityConfig
					});
					observer.complete();
				});
			}

			return () => {};
		});
	}
}
