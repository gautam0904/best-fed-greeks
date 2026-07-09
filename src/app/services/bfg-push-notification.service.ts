import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Plugins, PushNotification, PushNotificationActionPerformed } from '@capacitor/core';
const { PushNotifications } = Plugins;

import { FCM } from "@capacitor-community/fcm";
const fcm = new FCM();

import { HttpService } from './common/http.service';
import { BFGUserService } from './bfg-user.service';
import { MessageService } from './common/message.service';


@Injectable({
	providedIn: 'root',
})
export class BFGPushNotificationService {
	private _init:boolean = false;
	private _attemptingRegister:boolean = false;
	private _attemptedRegister:boolean = false;
	private _verified:boolean = false;
	private _pendingVerifiedResolve = null;
	private _pendingVerifiedReject = null;

	private _pushNotificationConfig:any = {
		topics:[],
		unsubscribedTopics:[]
	};

	constructor(
		private http: HttpService, private router: Router,
		private ms: MessageService
	) {
		if(localStorage.getItem('push-notification-config')) {
			this._pushNotificationConfig = JSON.parse(localStorage.getItem('push-notification-config'));

			if(!this._pushNotificationConfig.unsubscribedTopics) {
				this._pushNotificationConfig.unsubscribedTopics = [];
			}
		}
	}

	public clear() {
		console.log('Clear push notification setup');
		if( this._pushNotificationConfig.topics.length > 0) {
			console.log('Unsubscribing from topics');
			this._pushNotificationConfig.topics.forEach((topic) => {
				fcm.unsubscribeFrom({ topic: topic }).then(value => {
					console.log('Unsubscribed with value of ', value);
				});
			});
		}

		this._pushNotificationConfig = {
			topics:[],
			unsubscribedTopics:[]
		};
		this.init();
		this.saveConfig();
	}

	public async handlePushNotificationConfig(pnConfig) {
		let isSuccessfulInit = await this.init();

		if(!isSuccessfulInit) {
			return false;
		}

		let topics = pnConfig['topics'] as any,
			topicsAlreadySubscribed = [];
		if( this._pushNotificationConfig.topics.length > 0) {
			this._pushNotificationConfig.topics.forEach((topic) => {

				if(!topics[topic] || !topics[topic]['enabled']) {
					console.log('Unsubscribing from topic ' + topic);
					this.unsubscribeFromTopic(topic);
				}
			});
		}

		Object.keys(topics).forEach(topic => {
			// Don't count unsubscribed Topics. We will skip even if backend says to enable it
			if(topics[topic]['enabled'] && this._pushNotificationConfig.unsubscribedTopics.indexOf(topic) == -1) {
				console.log('Subscribing to topic ' + topic);
				this.subscribeToTopic(topic);
			}
		});

		return true;
	}

	public init() : Promise<boolean> {
		return new Promise((resolve, reject) => {
			if(this._attemptedRegister) {
				resolve(this._init);
				return;
			}

			console.log('Attempting initialization of push notifications');
			// Just in case a race condition
			if(this._attemptingRegister && !this._pendingVerifiedResolve) {
				this._pendingVerifiedResolve = resolve;
				this._pendingVerifiedReject = reject;
				return;
			}
			else if(this._attemptingRegister) {
				return;
			}

			this._attemptingRegister = true;

			this._attemptingRegister = false;
			resolve(true);
			return;

			/*
			PushNotifications.requestPermission().then( result => {
				if (result.granted) {
					PushNotifications.register().then((value) => {
						this._init = true;
						this._attemptedRegister = true;
						this._attemptingRegister = false;

						console.log('Registration for push notifications successful');

						PushNotifications.addListener('pushNotificationReceived', (notification:PushNotification) => {
							console.log('Push action performed (While in app)', notification);
							let type = notification.data && notification.data.type ? notification.data.type : 'Unknown';
							this.ms.showToast(notification.title, notification.body, 5000);
						});
						PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
							console.log('Push action performed (Clicking outside app)', notification);
							let data = notification.notification && notification.notification.data ? notification.notification.data : {};
							let type =  data.type ? data.type : 'Unknown';

							if(data.route) {
								this.router.navigateByUrl(data.route);
							}
						});

						resolve(true);

						if(this._pendingVerifiedResolve) {
							this._pendingVerifiedResolve(true);
							this._pendingVerifiedReject = null;
							this._pendingVerifiedResolve = null;
						}
					}).catch(reason => {
						this._attemptedRegister = true;
						this._attemptingRegister = false;

						console.error('Unable to register push notifications as ', reason);

						resolve(false);

						if(this._pendingVerifiedReject) {
							this._pendingVerifiedReject(false);
							this._pendingVerifiedReject = null;
							this._pendingVerifiedResolve = null;
						}
					});
				} else {
					// Show some error
				}
			}).catch(err => {
				console.error('Unable to register push notifications as error requesting permission');
				console.error(err);
			})
			*/
		});
	}

	public isSubscribedToChat(inHouseId) : boolean {
		let topic = 'house.' + inHouseId + '.chat-message-sent-by-chef';
		return this._pushNotificationConfig.topics.indexOf(topic) != -1 || this._pushNotificationConfig.topics.indexOf(topic + '.debug') != -1;
	}

	public isUnsubscribedFromChat(inHouseId) : boolean {
		let topic = 'house.' + inHouseId + '.chat-message-sent-by-chef';
		return this._pushNotificationConfig.unsubscribedTopics.indexOf(topic) != -1 || this._pushNotificationConfig.unsubscribedTopics.indexOf(topic + '.debug') != -1;
	}

	// Only for student. Chef is subscribed through backend generalization
	public subscribeToChat(userService, inHouseId) : boolean {
		if(!userService.isStudent()) return false;

		let houseId = inHouseId;
		let suffix = '';

		houseId = userService.user.bfg_house_id;
		suffix = 'chat-message-sent-by-chef';

		let topic = 'house.' + houseId + '.' + suffix;

		if(this._pushNotificationConfig.topics.indexOf(topic) != -1 || this._pushNotificationConfig.topics.indexOf(topic + '.debug') != -1) {
			return false;
		}

		fcm.subscribeTo({ topic: topic }).then(value => {
			console.log('Subscribe to of ' + topic + ' is', value);
		}).catch(err => {
			console.error(err);
		});

		this._pushNotificationConfig.topics.push(topic);
		this._pushNotificationConfig.unsubscribedTopics = this._pushNotificationConfig.unsubscribedTopics.filter((myTopic) => {
			return myTopic != topic;
		});

		this.saveConfig();

		return true;
	}

	public unsubscribeFromChat(userService, inHouseId) {
		if(!userService.isStudent()) return false;

		let houseId = inHouseId;
		let suffix = '';

		houseId = userService.user.bfg_house_id;
		suffix = 'chat-message-sent-by-chef';

		let topic = 'house.' + houseId + '.' + suffix;

		if(this._pushNotificationConfig.unsubscribedTopics.indexOf(topic) != -1 || this._pushNotificationConfig.unsubscribedTopics.indexOf(topic + '.debug') != -1) {
			return false;
		}

		fcm.unsubscribeFrom({ topic: topic }).then(value => {
			console.log('Unsubscribe of ' + topic + ' is', value);
		}).catch(err => {
			console.error(err);
		});

		this._pushNotificationConfig.unsubscribedTopics.push(topic);
		this._pushNotificationConfig.topics = this._pushNotificationConfig.topics.filter((myTopic) => {
			return myTopic != topic;
		});

		this.saveConfig();

		return true;
	}

	private subscribeToTopic(inTopic) {
		let suffix = '';

		if(this._pushNotificationConfig.topics.indexOf(inTopic) != -1) {
			return false;
		}

		fcm.subscribeTo({ topic: inTopic }).then(value => {
			console.log('Successfully subscribe to topic ' + inTopic);
			console.log('Value of ' + inTopic + ' is', value);
		}).catch(err => {
			console.log('Unsuccessfully subscribe to topic ' + inTopic);
			console.error(err);
		});

		this._pushNotificationConfig.topics.push(inTopic);

		this.saveConfig();

		return true;
	}

	private unsubscribeFromTopic(inTopic) {
		fcm.unsubscribeFrom({ topic: inTopic }).then(value => {
			console.log('Successfully unsubscribed from topic ' + inTopic, value);
		}).catch(value => {
			console.warn('Unable to unsubscribe from topic ' + inTopic, value);
		});

		this._pushNotificationConfig.topics = this._pushNotificationConfig.topics.filter((topic) => {
			return topic != inTopic;
		});

		this.saveConfig();

		return true;
	}

	private saveConfig() {
		localStorage.setItem('push-notification-config', JSON.stringify(this._pushNotificationConfig));
	}
}