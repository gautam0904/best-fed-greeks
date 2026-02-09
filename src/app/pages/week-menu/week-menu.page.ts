import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGMealPlanService } from '../../services/bfg-meal-plan.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-week-menu',
	templateUrl: './week-menu.page.html',
	styleUrls: ['./week-menu.page.scss'],
})
export class WeekMenuPage {
	public menuDetails: any = [];
	public menuDetailsByDay: any = {};

	public currentDate:any = '';
	public menuDetailsLoaded: boolean = false;
	public initialLoad: boolean = false;

	private _startDate:any = '';
	private _endDate:any = '';
	private _currentDay = 'monday';
	private _house = '';
	private _houseId:number = 0;

	public get house(): string {
		return this._house;
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

	constructor(
		private route:ActivatedRoute,
		private router:Router,
		private mealPlan: BFGMealPlanService,
		public bfgUser: BFGUserService,
		private http: HttpService,
		private msg: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		if(!this.initialLoad) {
			this.route.params.subscribe( async params =>{
		        this._houseId = params['houseId'];

		        if(this._houseId) {
		        	await this.msg.showLoader('Loading house settings, please wait...');
			        this.bfgUser.initializeHouses().subscribe(async response => {
			        	await this.msg.hideLoader();
			        	this.bfgUser.switchToHouse(this._houseId);
			        	this.setupWeekView();
			        });
		        }
		        else {
		        	this.setupWeekView();
		        }
			});
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

	public getDayActiveColor(day:string) {
		return this._currentDay == day ? 'primary' : 'secondary';
	}

	public switchToDay(day:string) {
		this._currentDay = day;
		this.menuDetails = this.menuDetailsByDay[this._currentDay] ? this.menuDetailsByDay[this._currentDay].meal_type_details : [];

		this.syncCurrentDateWithDay();
	}

	public switchToPreviousWeek() {
		let date = moment(this._startDate).subtract(1, 'week');
		this.setupWeekView(date);
	}

	public switchToNextWeek() {
		let date = moment(this._startDate).add(1, 'week');
		this.setupWeekView(date);
	}

	public editMealPlan() {
		this.router.navigateByUrl('/edit-meal-plan', {
			state: {
				date: this.currentDate
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

		// Because of how weeks are considered in moment. We want monday to be the start, so subtract back
		if(now.format('dddd').toLowerCase() == 'sunday') {
			this._startDate = moment(now).startOf('week').subtract(6, 'days');
			this._endDate = moment(now);
		}
		else {		
			this._startDate = moment(now).startOf('week').add(1, 'days');
			this._endDate = moment(now).endOf('week').add(1, 'days');
		}

		this._currentDay = now.format('dddd').toLowerCase();

		this.syncCurrentDateWithDay();
		this.loadWeekView();
	}

	protected async loadWeekView() {
		await this.msg.showLoader('Loading weekly menu, please wait...');

		this.menuDetailsLoaded = false;

		if(this.isStudent) {
			this.http.post('bfg/meals/load-weekly-menu', {
				start_date: this._startDate.format('YYYY-MM-DD'),
				end_date: this._endDate.format('YYYY-MM-DD')
			}).subscribe(async response => {
				await this.msg.hideLoader();

				this._house = response.house;
				this.menuDetailsByDay = response.menu_details_by_day;
				this.menuDetails = this.menuDetailsByDay[this._currentDay] ? this.menuDetailsByDay[this._currentDay].meal_type_details : [];
				
				this.initialLoad = true;
				this.menuDetailsLoaded = true;
				this.cdr.detectChanges();
			});
		}
		else if(this.isChef) {
			this.http.post('bfg/house-dashboard/load-weekly-menu', {
				start_date: this._startDate.format('YYYY-MM-DD'),
				end_date: this._endDate.format('YYYY-MM-DD'),
				bfg_house_id:this._houseId
			}).subscribe(async response => {
				await this.msg.hideLoader();

				this._house = response.house;
				this.menuDetailsByDay = response.menu_details_by_day;
				this.menuDetails = this.menuDetailsByDay[this._currentDay] ? this.menuDetailsByDay[this._currentDay].meal_type_details : [];

				this.initialLoad = true;
				this.menuDetailsLoaded = true;
				this.cdr.detectChanges();
			});
		}
		else {
			this.router.navigateByUrl('login');
		}
	}
}
