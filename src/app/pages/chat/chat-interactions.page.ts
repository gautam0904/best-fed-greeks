import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { IonContent, IonInfiniteScroll, ModalController } from '@ionic/angular';

import moment from 'moment';

@Component({
  standalone: false,
  selector: 'chat-interactions-page',
  templateUrl: './chat-interactions.page.html',
  styleUrls: ['./chat-interactions.page.scss'],
})
export class ChatInteractionsPage {
	public message: any = null;

	public getInteractions() {
		if(!this.message || !this.message.interactions) return [];

		let interactions = this.message.interactions;
		let allInteractions = [];
		for(let [key, value] of Object.entries(interactions)) {
			let myValue = value as any;
			for(let interaction of myValue) {
				let dateObj = moment(interaction.updated_at);
				let myObj = {
					name: interaction.name,
					updated_at: dateObj,
					updated_at_display: dateObj.format('dddd MMMM Do Y @ h:mm A'),
					interaction_type: key
				};
				allInteractions.push(myObj);
			}
		}

		// Descending order;
		allInteractions.sort((a, b) => {
			let updatedAtA = a.updated_at;
			let updatedAtB = b.updated_at;

			return updatedAtA.isBefore(updatedAtB) ? 1 : (updatedAtA.isAfter(updatedAtB) ? -1 : 0);
		});

		return allInteractions;
	}

	constructor(public modal: ModalController) {

	}

	public dismissModal() {
		this.modal.dismiss({
			dismissed: true
		});
	}
}
