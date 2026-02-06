import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';
import { BFGMealPlanService } from '../../services/bfg-meal-plan.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-chef-rating',
	templateUrl: './chef-rating.page.html',
	styleUrls: ['./chef-rating.page.scss'],
})
export class ChefRatingPage {
	public data: any = { feedback: '', rating: '' };

	constructor(
		public bfgUser: BFGUserService,
		private mealPlans: BFGMealPlanService,
		private http: HttpService,
		private msg: MessageService,
		public router: Router
	) {}

	public async ionViewDidEnter() {
		this.data.rating = '';
		this.data.feedback = '';
	}

	public async save() {
		if(!this.data.rating) {
			this.msg.showToast('Error', 'Please select a rating');
			return;
		}

		if(!this.data.feedback) {
			this.msg.showToast('Error', 'Please provide feedback');
			return;
		}

		await this.msg.showLoader('Saving chef rating, please wait...');

		this.http.post('bfg/ratings/save-chef-rating', {
			feedback: this.data.feedback,
			rating: this.data.rating
		}).subscribe(async response => {
			await this.msg.hideLoader();

			if(response.error) {
				await this.msg.showToast('Error', response.message ? response.message : 'There was an error saving your chef rating. Please contact technical support if this persists.');
				return;
			}

			await this.msg.showToast('Success', 'Thanks for rating your chef! We value your feedback.');

			this.router.navigateByUrl('/ratings');
		});
	}

}
