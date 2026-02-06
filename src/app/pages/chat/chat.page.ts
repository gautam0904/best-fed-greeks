import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonInfiniteScroll, ModalController } from '@ionic/angular';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import { ChatInteractionsPage } from './chat-interactions.page';

import moment from 'moment';

@Component({
	standalone: false,
	selector: 'app-chat',
	templateUrl: './chat.page.html',
	styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
	@ViewChild(IonContent) content: IonContent;
	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

	public messages: any = [];
	public loaded: boolean = false;

	public newMsg = '';
	public currentUserId: string = '';

	public get isStudent(): boolean {
		return this.bfgUser.isStudent();
	}

	public get isChef(): boolean {
		return this.bfgUser.isChef() || this.bfgUser.isSuperChef();
	}

	private _houseId: number = 0;
	private _isAddingInteraction: boolean = false;
	private _messageAddingInteractionTo: any = null;

	constructor(
		public bfgUser: BFGUserService,
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpService,
		private msg: MessageService,
		private cd: ChangeDetectorRef,
		public modalController: ModalController
	) { }

	ionViewDidEnter() {
		this.route.params.subscribe(params => {
			this._houseId = params['houseId'] ? params['houseId'] : 0;

			if (this._houseId) {
				this.bfgUser.initializeHouses().subscribe(async response => {
					this.bfgUser.switchToHouse(this._houseId);
					this.load();
				});
			}
			else {
				this.load();
			}
		});
	}

	public isAddingInteraction() {
		return this._isAddingInteraction;
	}

	public startAddingInteraction(message) {
		if (message.addingInteraction) {
			message.addingInteraction = false;
			this._isAddingInteraction = false;
			if (this._messageAddingInteractionTo) {
				this._messageAddingInteractionTo.addingInteraction = false;
				this._messageAddingInteractionTo = null;
			}
			return true;
		}
		this._isAddingInteraction = true;

		if (this._messageAddingInteractionTo) {
			this._messageAddingInteractionTo.addingInteraction = false;
		}

		message.addingInteraction = true;
		this._messageAddingInteractionTo = message;
		this.cd.markForCheck();
		return true;
	}

	public async viewInteractions(message) {
		const modal = await this.modalController.create({
			component: ChatInteractionsPage,
			componentProps: {
				message: message
			}
		});
		return await modal.present();
	}

	public async addInteraction(interactionType) {
		await this.msg.showLoader('Saving reaction, please wait...');

		let myMessage = this._messageAddingInteractionTo;

		if (this.bfgUser.isChef() || this.bfgUser.isSuperChef()) {
			this.http.post('bfg/chat/add-interaction-as-chef', {
				message_id: myMessage.id,
				bfg_house_id: this._houseId,
				interaction_type: interactionType
			}).subscribe(async response => {
				await this.msg.hideLoader();
				this.updateInteractionView(interactionType);
			});
		}
		else {
			this.http.post('bfg/chat/add-interaction-as-student', {
				message_id: myMessage.id,
				interaction_type: interactionType
			}).subscribe(async response => {
				await this.msg.hideLoader();
				this.updateInteractionView(interactionType);
			});
		}
	}

	protected updateInteractionView(interactionType) {
		let myMessage = this._messageAddingInteractionTo;
		if (!myMessage.interactions) {
			myMessage.interactions = {};
		}

		if (!myMessage.interactions[interactionType]) {
			myMessage.interactions[interactionType] = [];
		}

		let userId = this.bfgUser.getId();
		let isStudent = this.bfgUser.isStudent();

		userId = (isStudent ? 'user' : 'backend') + '_' + userId;

		for (let [key, value] of Object.entries(myMessage.interactions)) {
			if (!Array.isArray(value)) continue;

			let idxsToRemove = [];

			value.forEach((interaction, idx) => {
				if (interaction.user_id == userId) {
					idxsToRemove.push(idx);
				}
			});

			if (idxsToRemove.length > 0) {
				myMessage.interactions[key] = value.filter((interaction, idx) => {
					return idxsToRemove.indexOf(idx as any) == -1;
				});
			}
		}

		myMessage.interactions[interactionType].push({
			user_id: userId,
			created_at: moment().format('YYYY-M-DD HH:mm:ss')
		});

		this._messageAddingInteractionTo.interactions = myMessage.interactions;
		this._isAddingInteraction = false;
		this._messageAddingInteractionTo.addingInteraction = false;
		this._messageAddingInteractionTo = null;

		this.cd.markForCheck();
	}

	public getMessages() {
		return this.messages;
	}

	public getInteractions(message) {
		if (!message.interactions) {
			return {};
		}

		let interactions = {};
		for (let [key, value] of Object.entries(message.interactions)) {
			let myValue = value as any;
			interactions[key] = myValue.length;
		}

		return interactions;
	}

	public async sendMessage() {
		if (!this.newMsg) return;

		await this.msg.showLoader('Sending message, please wait...');

		if (this.bfgUser.isChef() || this.bfgUser.isSuperChef()) {
			this.http.post('bfg/chat/send-message-as-chef', {
				bfg_house_id: this._houseId,
				latest_message_id: this.messages.length > 0 ? this.messages[this.messages.length - 1].id : null,
				message: this.newMsg
			}).subscribe(async response => {
				await this.msg.hideLoader();

				this.newMsg = '';
				// Newly loaded messages, including most recent
				this.messages = this.messages.concat(response.messages);

				this.scrollToBottom();

				this.loaded = true;
			});
		}
		else {
			this.http.post('bfg/chat/send-message-as-student', {
				latest_message_id: this.messages.length > 0 ? this.messages[this.messages.length - 1].id : null,
				message: this.newMsg
			}).subscribe(async response => {
				await this.msg.hideLoader();

				this.newMsg = '';
				this.messages = this.messages.concat(response.messages);
				this.scrollToBottom();

				this.loaded = true;
			});
		}
	}

	public async refreshChat() {
		this.load(true);
	}

	public async loadMorePreviousMessages(infiniteScroll) {
		this.load(true, infiniteScroll);
	}

	protected async load(isRefresh = false, infiniteScroll: any = false) {
		await this.msg.showLoader();

		if (this.bfgUser.isChef() || this.bfgUser.isSuperChef()) {
			let allMessageIds = [];
			for (let message of this.messages) {
				allMessageIds.push(message.id);
			}
			this.http.post('bfg/chat/load-messages-as-chef', {
				bfg_house_id: this._houseId,
				all_message_ids: allMessageIds.join(','),
				earliest_message_id: this.messages.length > 0 && infiniteScroll ? this.messages[0].id : null,
				latest_message_id: this.messages.length > 0 && !infiniteScroll ? this.messages[this.messages.length - 1].id : null
			}).subscribe(async response => {
				await this.msg.hideLoader();

				if (isRefresh && !infiniteScroll) {
					this.messages = this.messages.concat(response.messages);
				}
				else if (isRefresh && infiniteScroll) {
					this.messages = response.messages.concat(this.messages);
					this.infiniteScroll.complete();
					infiniteScroll.target.complete();
					if (response.messages.length == 0) {
						infiniteScroll.target.disabled = true;
					}
				}
				else {
					this.messages = response.messages;
				}

				this.currentUserId = response.user_id;

				if (response.interactions) {
					for (let message of this.messages) {
						if (!response.interactions[message.id]) continue;

						message.interactions = response.interactions[message.id];
					}
				}

				if (!infiniteScroll) {
					this.scrollToBottom();
				}
				else {
					this.cd.markForCheck();
				}

				this.loaded = true;
			});
		}
		else {
			let allMessageIds = [];
			for (let message of this.messages) {
				allMessageIds.push(message.id);
			}
			this.http.post('bfg/chat/load-messages-as-student', {
				all_message_ids: allMessageIds.join(','),
				earliest_message_id: this.messages.length > 0 && infiniteScroll ? this.messages[0].id : null,
				latest_message_id: this.messages.length > 0 && !infiniteScroll ? this.messages[this.messages.length - 1].id : null
			}).subscribe(async response => {
				await this.msg.hideLoader();

				if (isRefresh && !infiniteScroll) {
					this.messages = this.messages.concat(response.messages);
				}
				else if (isRefresh && infiniteScroll) {
					this.messages = response.messages.concat(this.messages);

					this.infiniteScroll.complete();
					if (response.messages.length == 0) {
						infiniteScroll.target.disabled = true;
					}
				}
				else {
					this.messages = response.messages;
				}

				if (response.interactions) {
					for (let message of this.messages) {
						if (!response.interactions[message.id]) continue;

						message.interactions = response.interactions[message.id];
					}
				}

				this.currentUserId = response.user_id;

				if (!infiniteScroll) {
					this.scrollToBottom();
				}
				else {
					this.cd.markForCheck();
				}

				this.loaded = true;
			});
		}
	}

	protected scrollToBottom() {
		setTimeout(() => {
			this.content.scrollToBottom(100);
			setTimeout(() => {
				this.content.scrollToBottom(100);
				setTimeout(() => {
					this.cd.markForCheck();
				});
			}, 100)
		}, 0);
	}
}
