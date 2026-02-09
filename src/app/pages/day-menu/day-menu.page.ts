import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
  selector: 'app-day-menu',
  templateUrl: './day-menu.page.html',
  styleUrls: ['./day-menu.page.scss'],
})
export class DayMenuPage implements OnInit {

	public canRequestLatePlate: boolean = false;
	public canCheckIn: boolean = false;
	public canCancelLatePlate: boolean = false;
	public canCancelCheckIn: boolean = false;
	public checkInCutoffMessage: any = false;
	public latePlateCutoffMessage: any = false;
	public hasRated: boolean = false;

	public hasTimeSlots: boolean = false;
	public timeSlotSignups: Array<any> = [];
	public timeSlotSignup: string = '';

	public loaded: boolean = false;

	public menuDayDetails: any = [];
	public get day() {
		return this._date ? moment(this._date).format('dddd') : '';
	}

	public get date() {
		return this._date ? this._date : '';
	}

	private _date = '';
	private _mealType = '';
	private _houseId:any = 0;
	private _currentUrl = '';

	constructor(
		private route:ActivatedRoute,
		private router:Router,
		public bfgUser: BFGUserService,
		private http: HttpService,
		private msg: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.route.params.subscribe( params =>{
	        this._date = params['date'];
	        this._mealType = params['mealType'];
	        this._houseId = params['houseId'];

	        this.load();
		});
	}

	ionViewDidEnter() {
		if(this.loaded) {
			this.load();
		}
	}

	public get houseId():number {
		return this._houseId;
	}

	public get isStudent():boolean {
		return this.bfgUser.isStudent();
	}

	public get isChef():boolean {
		return this.bfgUser.isChef() || this.bfgUser.isSuperChef();
	}

	public getTitle() {
		return this._date ? moment(this._date).format('MMM DD, YYYY') : '';
	}

	public getMealType() {
		return this._mealType ? this._mealType.charAt(0).toUpperCase() + this._mealType.slice(1) : '';
	}

	public goToRate() {
		this.router.navigateByUrl('/meal-rating', {
			state: {
				date: this._date,
				mealType: this._mealType
			}
		});
	}

	public mealDetailsChanged() {
		this.load();
	}

	public async handleMealPlanClick(type:string) {
		await this.msg.showLoader('Performing action, please wait...');

		this.http.post('bfg/meals/quick-menu-day-action', {
			action:type,
			date:this._date,
			meal_type:this._mealType,
			time_slot_signup: this.timeSlotSignup
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error || !response.success) {
				await this.msg.showToast('Error', response.message ? response.message : 'There was an error performing the action. Please contact technical support if this persists.', 10000);
				return;
			}

			this.load();
		});
	}

	protected async load() {
		await this.msg.showLoader();

		if(this.bfgUser.isChef() || this.bfgUser.isSuperChef()) {
			this.http.post('bfg/house-dashboard/load-day-meal', {
				date:this._date,
				meal_type:this._mealType,
				bfg_house_id:this._houseId,
				load_additional_info:true
			}).subscribe(async response => {
				await this.msg.hideLoader();

				if(response.error || !response.success) {
					await this.msg.showToast('Error', response.message ? response.message : 'The meal for this day could not be loaded. Please try another day.', 10000);
					return;
				}

				this.menuDayDetails = response.menu_day_details;

				this.loaded = true;
				this.cdr.detectChanges();
			});
		}
		else {
			this.http.post('bfg/meals/load-day-meal', {
				date:this._date,
				meal_type:this._mealType,
				load_additional_info:true
			}).subscribe(async response => {
				await this.msg.hideLoader();

				if(response.error || !response.success) {
					await this.msg.showToast('Error', response.message ? response.message : 'The meal for this day could not be loaded. Please try another day.', 10000);
					return;
				}

				this.menuDayDetails = response.menu_day_details;
				this.hasRated = response.has_rated;
				this.canRequestLatePlate = response.can_request_late_plate;
				this.canCheckIn = response.can_check_in;
				this.canCancelLatePlate = response.can_cancel_late_plate;
				this.canCancelCheckIn = response.can_cancel_check_in;
				this.checkInCutoffMessage = response.check_in_cutoff_message;
				this.latePlateCutoffMessage = response.late_plate_cutoff_message;
				this.hasTimeSlots = response.has_time_slots;
				this.timeSlotSignups = response.time_slot_signups;
				this.timeSlotSignup = response.time_slot_signup ? response.time_slot_signup : '';

				this.loaded = true;
				this.cdr.detectChanges();
			});
		}
	}
}
