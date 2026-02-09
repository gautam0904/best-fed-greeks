import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import moment from 'moment';
import { Router } from '@angular/router';

import { Observable, BehaviorSubject } from 'rxjs';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

@Component({
  standalone: false,
	selector: 'app-meal-details',
	templateUrl: './meal-details.component.html',
	styleUrls: ['./meal-details.component.scss'],
})
export class MealDetailsComponent implements OnInit {
	private _detailsUpdated = new BehaviorSubject<boolean>(false);
	private _isFetchingConfig: boolean = false;
	public detailsUpdated$ = this._detailsUpdated.asObservable();

	@Input()
	public drilldown:boolean = true;

	@Input()
	public hideHeader:boolean = false;

	@Input()
	public day = '';

	@Input()
	public date = '';

	@Input()
	public houseId:number = 0;

	@Input()
	public details = []

	@Output()
	public detailsChanged = new EventEmitter();

	constructor(
		private router:Router,
		public bfgUser: BFGUserService,
		private http: HttpService,
		private msg: MessageService
	) { }

	ngOnInit() {}

	public dateFormatted() {
		return this.date ? moment(this.date).format('MMM DD, YYYY') : '';
	}

	public get isStudent():boolean {
		return this.bfgUser.isStudent();
	}

	public get isChef():boolean {
		return this.bfgUser.isChef() || this.bfgUser.isSuperChef();
	}

	public isLiked(detail) {
		return detail.liked;
	}

	public getNumberOfLikes(detail) {
		return detail.number_of_likes ? detail.number_of_likes : 0;
	}

	public async removeRepeatMealPlan(idx:number, meal:string, latePlate: boolean = false) {
		await this.msg.showLoader('Removing repeat meal plan, please wait...');

		this.http.post('bfg/meals/remove-repeat-meal-plan', {
			date: moment(this.date).format('MMM DD, YYYY'),
			day:this.day ? this.day.toLowerCase() : moment(this.date).format('dddd').toLowerCase(),
			meal_type:meal,
			late_plate: latePlate ? 1 : 0
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error) {
				this.msg.showToast('Error', response.message ? response.message : 'Error removing repeat meal, please contac technical support if this persists');
				return;
			}

			this.msg.showToast('Success', 'Meal plan repeat removed successfully');

			this.details[idx].repeated = false;
			this.details[idx].checked_in = response.checked_in;
			this.details[idx].late_plate = response.late_plate;

			this.detailsChanged.emit();
			this._detailsUpdated.next(true);
		});
	}

	public async likeMeal(idx, detail, like: boolean = true) {
		if(like) {
			await this.msg.showLoader('Liking meal, please wait...');
		}
		else {
			await this.msg.showLoader('Removing meal like, please wait...');
		}

		this.http.post('bfg/meals/like-meal', {
			date: moment(this.date).format('MMM DD, YYYY'),
			day:this.day ? this.day.toLowerCase() : moment(this.date).format('dddd').toLowerCase(),
			meal_type:detail.meal,
			like: like ? 1 : 0
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error) {
				this.msg.showToast('Error', response.message ? response.message : 'Error liking meal, please contact technical support if this persists');
				return;
			}

			this.msg.showToast('Success', (like ? 'Meal liked' : 'Meal like removed'));

			this.details[idx].liked = like;

			this.detailsChanged.emit();
			this._detailsUpdated.next(true);
		});
	}

	public goToMenuDetails(d:any) {
		if(!this.drilldown) return;

		if(this.houseId) {
			this.router.navigateByUrl(['/day-menu', this.date, d.meal.toLowerCase(), this.houseId].join('/'));
		}
		else {
			this.router.navigateByUrl(['/day-menu', this.date, d.meal.toLowerCase()].join('/'));
		}
	}

	public goToSignupRoster(d:any) {
		this.router.navigateByUrl(['/house-roster', this.houseId, this.date, d.meal.toLowerCase()].join('/'));
	}

	public goToLatePlateSignupRoster(d:any) {
		this.router.navigateByUrl(['/house-roster', this.houseId, this.date, 'late-plate-' + d.meal.toLowerCase()].join('/'));
	}
}
