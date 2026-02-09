import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-house-roster',
	templateUrl: './house-roster.page.html',
	styleUrls: ['./house-roster.page.scss'],
})
export class HouseRosterPage implements OnInit {
	public users:any = [];
	public loaded: boolean = false;
	public mealType: string = '';
	public finalized: boolean = false;
	public usersSignedUp: number = 0;
	public houseName: string = '';

	/*
	public data = [
	// TODO Make Icons populate remove-circle icon and text color red if allergy and diet are not null
	// TODO Make Icons populate alert icon and text color yellow if allergy or diet are not null - not both
	// TODO Make Icons populate checkmark-circle icon and text color green if allergy and diet are both null
	// TODO If studentAllergy is null print string 'No Allergies'
	// TODO If studentDiet is null print string 'No Dietary Restrictions'
	{
		statusIcon: 'remove-circle',
		studentName: 'Student 1',
		studentAllergy: 'Seafood',
		studentDiet: 'Vegetarian',
	},
	{
		statusIcon: 'checkmark-circle',
		studentName: 'Student 2',
		studentAllergy: null,
		studentDiet: null,
	},
	{
		statusIcon: 'alert',
		studentName: 'Student 3',
		studentAllergy: null,
		studentDiet: 'Gluten Free',
	},
	{
		statusIcon: 'alert',
		studentName: 'Student 4',
		studentAllergy: null,
		studentDiet: 'Vegetarian',
	},]*/

	private _houseId:number = 0;
	private _date:string = '';
	private _mealType:string = '';
	private _timeSlotsSeen = [];
	private _timeSlotsSignupDetails = {};

	public get houseId(): number {
		return this._houseId;
	}

	constructor(
		private route:ActivatedRoute,
		private router:Router,
		public bfgUser: BFGUserService,
		private http: HttpService,
		private msg: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.route.params.subscribe(async params =>{
	        this._houseId = params['houseId'];

	        if(params['mealType']) {
	        	this._date = params['date'];
	        	this._mealType = params['mealType'];
	        }

			if(this._houseId) {
	        	await this.msg.showLoader('Loading house settings, please wait...');
		        this.bfgUser.initializeHouses().subscribe(async response => {
		        	await this.msg.hideLoader();
		        	this.bfgUser.switchToHouse(this._houseId);
		        	this.load();
		        });
	        }
	        else {
	        	this.load();
	        }
		});
	}

	public getDateFormatted() {
		return this._date ? moment(this._date).format('MMM DD, YYYY') : '';
	}

	public async sendPickupNotification(timeSlot) {
		await this.msg.showLoader();

		this.http.post('bfg/house-dashboard/send-time-slot-signup-pickup-notification', {
			date:this._date,
			meal_type:this._mealType,
			bfg_house_id:this._houseId,
			time_slot: timeSlot
		}).subscribe(async response => {
			await this.msg.hideLoader();


			if(response.success) {
				this._timeSlotsSignupDetails[timeSlot].notification_sent = true;
			}
		});
	}

	public amountSignedUpForTimeSlot(timeSlot) {
		return this._timeSlotsSignupDetails[timeSlot] ? this._timeSlotsSignupDetails[timeSlot].signup_amount : 0;
	}

	public timeSlotSignupNotificationSent(timeSlot) {
		return this._timeSlotsSignupDetails[timeSlot] ? this._timeSlotsSignupDetails[timeSlot].notification_sent : false;
	}

	protected async load() {
		await this.msg.showLoader();

		this.http.post('bfg/house-dashboard/load-roster', {
			date:this._date,
			meal_type:this._mealType,
			bfg_house_id:this._houseId
		}).subscribe(async response => {
			await this.msg.hideLoader();

			this._timeSlotsSignupDetails = response.signup_slot_details;
			this._timeSlotsSeen = [];
			let users = response.users;
			this.usersSignedUp = 0;

			users = users.map((user) => {
				if(user['allergies']) {
					user.statusIcon = 'remove-circle';
				}
				else if(user['dietary_preferences']) {
					user.statusIcon = 'alert';
				}
				else {
					user.statusIcon = 'checkmark-circle';
				}

				return user;
			});

			let allData = [];
			let timeSlotSignupsSeen = [];

			users.forEach((user) => {
				this.usersSignedUp++;

				if(user.time_slot_signup && timeSlotSignupsSeen.indexOf(user.time_slot_signup) == -1) {
					timeSlotSignupsSeen.push(user.time_slot_signup);
					allData.push({
						is_group: true,
						time_slot_signup: user.time_slot_signup,
						time_slot_signup_display: user.time_slot_signup_display
					});
				}

				allData.push(user);
			});

			this.houseName = response.houseName;
			this.users = allData;
			this.mealType = response.meal_type;
			this.finalized = !!response.finalized;

			this.loaded = true;
			this.cdr.detectChanges();
		});
	}
}
