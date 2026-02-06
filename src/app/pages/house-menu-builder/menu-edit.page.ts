import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-house-menu-edit',
	templateUrl: './menu-edit.page.html',
	styleUrls: ['./menu-edit.page.scss'],
})
export class MenuEditPage {
	public loaded: boolean = false;

	public recipes = [];

	private _mealPlanAvailability = [];

	private _houseId: any = 0;
	private _mondayDate: string = '';
	private _dateStart: string = '';
	private _dateEnd: string = '';
	private _dateRangeDisplay: string = '';

	constructor(
		public bfgUser: BFGUserService,
		private router:Router,
		private route: ActivatedRoute,
		private http: HttpService,
		private msg: MessageService
	) {}

	public get dateRangeDisplay() {
		return this._dateRangeDisplay;
	}

	public get menuPlanAvailability() {
		return this._mealPlanAvailability;
	}

	ngOnInit() {
		this.route.params.subscribe( params => {
			this._houseId = parseInt(params['houseId']);
			this._mondayDate = params['date'];
			this._dateStart = moment(this._mondayDate).format('MM/DD/YYYY');
			this._dateEnd = moment(this._dateStart).add('6', 'days').format('MM/DD/YYYY');
			this._dateRangeDisplay = this._dateStart + ' - ' + this._dateEnd;
		})
	}

	public async ionViewDidEnter() {
		if(!this.bfgUser.isSuperChef() && !this.bfgUser.isChef()) {
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		if(this._houseId) {
			this.loadMenuEdit(this._houseId);
		}
	}

	public async addMenuItem(menuDay, mealType, $record) {
		// Already saved recipe. Go ahead an save the menu dish
		if($record.id) {
			this.saveMenuDish(menuDay, mealType, $record);
		}
		else if($record.name) {
			await this.msg.showLoader('Saving, please wait...');

			this.http.post('bfg/menu-builder/save-recipe', {
				bfg_house_id: this._houseId,
				name: $record.name,
				mealType: mealType.display
			}).subscribe(async response => {

				$record.id = response.id;

				if($record.id) {
					mealType.recipeIds.push($record.id);
					this.recipes = [].concat(this.recipes, [{"name": $record.name, "id":response.recipe_id}]);
					this.saveMenuDish(menuDay, mealType, $record);
				}
				else {
					await this.msg.hideLoader();
				}
			});
			console.log(menuDay, mealType, $record);
		}
	}

	public async removeMenuItem(menuDay, mealType, $record) {
		await this.msg.showLoader('Removing menu dish, please wait...');

		this.http.post('bfg/menu-builder/remove-menu-dish', {
			bfg_house_id: this._houseId,
			date: menuDay.date,
			meal_type: mealType.display,
			recipe_id: $record.value.id
		}).subscribe(async response => {
			await this.msg.hideLoader();
		});
	}

	protected async saveMenuDish(menuDay, mealType, $record) {
		await this.msg.showLoader('Saving, please wait...');

		this.http.post('bfg/menu-builder/save-menu-dish', {
			bfg_house_id: this._houseId,
			start_date: menuDay.date,
			meal_type: mealType.display,
			recipe_id: $record.id
		}).subscribe(async response => {
			await this.msg.hideLoader();
		});
	}

	public back() {
		this.router.navigate(['/house-menu-builder/summary/', this._houseId, this._mondayDate]);
	}

	protected async loadMenuEdit(houseId) {
		await this.msg.showLoader();

		this._houseId = houseId;

		this.bfgUser.initializeHouses().subscribe(async myResponse => {
			this.bfgUser.switchToHouse(houseId);

			this.http.post('bfg/menu-builder/load-menu', {
				bfg_house_id: houseId,
				monday_of_week: this._mondayDate
			}).subscribe(async response => {
				await this.msg.hideLoader();

				let mealPlanAvailability = [];
				let serviceAvailability = response.meal_plan_service_availability;
				let menuDishes = response.menu_dishes;
				let days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

				let recipesByDayType = [];
				for(let menuDish of menuDishes) {
					let mealType = menuDish.mealType;
					let day = moment(menuDish.start).format('dddd').toLowerCase();

					if(!recipesByDayType[day]) {
						recipesByDayType[day] = {};
					}

					if(!recipesByDayType[day][mealType]) {
						recipesByDayType[day][mealType] = [];	
					}

					recipesByDayType[day][mealType].push(menuDish.recipe_id);
				}

				let currentDate = moment(this._mondayDate);
				this.recipes = response.recipes;
				let currentIteration = 0;

				for(let day of days) {
					if(currentIteration > 0) {
						currentDate = currentDate.add(1, 'days');
					}
					if(serviceAvailability[day]) {
						let mealTypes = [];
						if(serviceAvailability[day]['Breakfast'] && serviceAvailability[day]['Breakfast']['enabled']) {
							let recipeIds = recipesByDayType[day] && recipesByDayType[day]['Breakfast'] ? recipesByDayType[day]['Breakfast'] : [];
							mealTypes.push({
								recipeIds: recipeIds,
								display:'Breakfast'
							});
						}

						if(serviceAvailability[day]['Brunch'] && serviceAvailability[day]['Brunch']['enabled']) {
							let recipeIds = recipesByDayType[day] && recipesByDayType[day]['Brunch'] ? recipesByDayType[day]['Brunch'] : [];
							mealTypes.push({
								recipeIds: recipeIds,
								display:'Brunch'
							});
						}

						if(serviceAvailability[day]['Lunch'] && serviceAvailability[day]['Lunch']['enabled']) {
							let recipeIds = recipesByDayType[day] && recipesByDayType[day]['Lunch'] ? recipesByDayType[day]['Lunch'] : [];
							mealTypes.push({
								recipeIds: recipeIds,
								display:'Lunch'
							});
						}

						if(serviceAvailability[day]['Dinner'] && serviceAvailability[day]['Dinner']['enabled']) {
							let recipeIds = recipesByDayType[day] && recipesByDayType[day]['Dinner'] ? recipesByDayType[day]['Dinner'] : [];
							mealTypes.push({
								recipeIds: recipeIds,
								display:'Dinner'
							});
						}

						if(mealTypes.length > 0) {
							mealPlanAvailability.push({
								day: day.substring(0, 1).toUpperCase() + day.substring(1),
								date: currentDate.format('YYYY-MM-DD'),
								dateDisplay: currentDate.format('MM/DD/YYYY'),
								mealTypes: mealTypes,
							});
						}
					}

					currentIteration++;
				}

				this._mealPlanAvailability = mealPlanAvailability;

				this.loaded = true;
			});
		});
	}
}
