import { Component, ChangeDetectorRef } from '@angular/core';

import { NgForm } from '@angular/forms';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';
import { BFGPushNotificationService } from '../../services/bfg-push-notification.service';

@Component({
  standalone: false,
	selector: 'app-profile',
	templateUrl: './profile.page.html',
	styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
	public account: any = { name: '', password: '', password_confirmation: '' };

	public house: string = '';
	public name: string = '';
	public loaded: boolean = false;

	public allergies: any = [];
	public diet:any = [];

	public subscribedToChat:boolean = false;
	public liveOutDesignation:boolean = false;

	constructor(
		public bfgUser: BFGUserService,
		private push: BFGPushNotificationService,
		private http: HttpService,
		private msg: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	public async ionViewDidEnter() {
		await this.msg.showLoader();

		this.http.post('bfg/user/load-profile', {}).subscribe(async response => {
			await this.msg.hideLoader();

			this.house = response.house;
			this.name = this.bfgUser.user.name;
			this.allergies = response.allergies;
			this.diet = response.dietary_preferences;
			this.liveOutDesignation = response.live_out_designation;
			this.subscribedToChat = this.push.isSubscribedToChat(this.bfgUser.user.bfg_house_id);
			// this.hasMealServiceToday = !!response.has_meal_service_today;
			// this.menuDayDetails = response.menu_day_details;
			// this.day = response.day;
			// this.date = response.date;

			this.loaded = true;
			this.cdr.detectChanges();
		});
	}

	public async save(form:NgForm) {
		let checkedAllergyIds = [],
			checkedDietIds = [];

		if (!form.valid) return;

		if(this.subscribedToChat) {
			this.push.subscribeToChat(this.bfgUser, this.bfgUser.user.bfg_house_id)
		}
		else {
			this.push.unsubscribeFromChat(this.bfgUser, this.bfgUser.user.bfg_house_id)
		}

		this.bfgUser.name = this.name;

		this.allergies.forEach(function(allergy) {
			if(allergy.checked) {
				checkedAllergyIds.push(allergy.id);
			}
		});

		this.diet.forEach(function(d) {
			if(d.checked) {
				checkedDietIds.push(d.id);
			}
		});

		await this.msg.showLoader('Saving profile settings, please wait...');

		this.http.post('bfg/user/save-profile', {
			name: this.name,
			allergy_ids: checkedAllergyIds,
			diet_ids: checkedDietIds,
			live_out_designation: this.liveOutDesignation ? 1 : 0,
			account: this.account
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if(!response['success']) {
				await this.msg.showToast(
					'Error',
					response['message'] ?
					response['message'] : 
					'An error occurred while saving. Please contact us if this continues.'
				);
			}
			else {
				this.account.password = '';
				this.account.password_confirmation = '';
				await this.msg.showToast('Success', 'Profile settings saved successfully');
			}
		});
	}
}
