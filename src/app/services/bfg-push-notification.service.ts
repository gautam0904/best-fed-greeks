import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';

@Injectable({
	providedIn: 'root',
})
export class BFGPushNotificationService {
	private isInitialized = false;

	constructor(private platform: Platform) {
		// Initialization is now done in init()
	}

	public async init(): Promise<boolean> {
		try {
			if (this.isInitialized) {
				return true;
			}

			await this.platform.ready();

			// Check if native platform (iOS/Android) for push
			if (!this.platform.is('capacitor')) {
				console.warn('Push notifications only work on Capacitor native platforms');
				return false;
			}

			// Request permission
			const permissionState = await PushNotifications.requestPermissions();
			if (permissionState.receive !== 'granted') {
				console.warn('Push notification permission not granted');
				return false;
			}

			// Register with Apple / Google to receive push via APNS/FCM
			await PushNotifications.register();

			// Set up listeners
			this.setupListeners();

			this.isInitialized = true;
			return true;
		} catch (error) {
			console.error('Error initializing push notifications:', error);
			return false;
		}
	}

	private setupListeners() {
		try {
			// On successful registration
			PushNotifications.addListener('registration', (token: any) => {
				console.log('Push registration success, token:', token.value);
				this.storeToken(token.value);
			});

			// On registration error
			PushNotifications.addListener('registrationError', (error: any) => {
				console.error('Error on registration:', error);
			});

			// On push received
			PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
				console.log('Push received:', notification);
			});

			// On push clicked
			PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
				console.log('Push action performed:', notification);
			});
		} catch (error) {
			console.error('Error setting up push listeners:', error);
		}
	}

	private storeToken(token: string) {
		try {
			const config = this.getStoredConfig();
			config.token = token;
			localStorage.setItem('push-notification-config', JSON.stringify(config));
		} catch (error) {
			console.error('Error storing push token:', error);
		}
	}

	private getStoredConfig(): any {
		try {
			const stored = localStorage.getItem('push-notification-config');
			return stored ? JSON.parse(stored) : {};
		} catch (error) {
			console.error('Error getting stored config:', error);
			return {};
		}
	}

	public async subscribeToTopic(topic: string): Promise<boolean> {
		try {
			await FCM.subscribeTo({ topic });
			console.log('Subscribed to topic:', topic);
			return true;
		} catch (error) {
			console.error('Error subscribing to topic:', error);
			return false;
		}
	}

	public async unsubscribeFromTopic(topic: string): Promise<boolean> {
		try {
			await FCM.unsubscribeFrom({ topic });
			console.log('Unsubscribed from topic:', topic);
			return true;
		} catch (error) {
			console.error('Error unsubscribing from topic:', error);
			return false;
		}
	}

	public clear(): void {
		try {
			this.isInitialized = false;
			localStorage.removeItem('push-notification-config');
		} catch (error) {
			console.error('Error clearing push notifications:', error);
		}
	}

	// Add missing methods that other parts of the app expect
	public isSubscribedToChat(inHouseId: string): boolean {
		try {
			const topic = 'house.' + inHouseId + '.chat-message-sent-by-chef';
			const config = this.getStoredConfig();
			return config.topics && config.topics.indexOf(topic) !== -1;
		} catch (error) {
			console.error('Error checking chat subscription:', error);
			return false;
		}
	}

	public isUnsubscribedFromChat(inHouseId: string): boolean {
		try {
			const topic = 'house.' + inHouseId + '.chat-message-sent-by-chef';
			const config = this.getStoredConfig();
			return config.unsubscribedTopics && config.unsubscribedTopics.indexOf(topic) !== -1;
		} catch (error) {
			console.error('Error checking chat unsubscription:', error);
			return false;
		}
	}

	public subscribeToChat(userService: any, inHouseId: string): boolean {
		try {
			if (!userService.isStudent()) return false;

			const houseId = userService.user.bfg_house_id;
			const suffix = 'chat-message-sent-by-chef';
			const topic = 'house.' + houseId + '.' + suffix;

			const config = this.getStoredConfig();
			if (!config.topics) config.topics = [];
			if (!config.unsubscribedTopics) config.unsubscribedTopics = [];

			if (config.topics.indexOf(topic) !== -1) {
				return false;
			}

			this.subscribeToTopic(topic).then(() => {
				config.topics.push(topic);
				config.unsubscribedTopics = config.unsubscribedTopics.filter((myTopic: string) => myTopic !== topic);
				localStorage.setItem('push-notification-config', JSON.stringify(config));
			});

			return true;
		} catch (error) {
			console.error('Error subscribing to chat:', error);
			return false;
		}
	}

	public unsubscribeFromChat(userService: any, inHouseId: string): boolean {
		try {
			if (!userService.isStudent()) return false;

			const houseId = userService.user.bfg_house_id;
			const suffix = 'chat-message-sent-by-chef';
			const topic = 'house.' + houseId + '.' + suffix;

			const config = this.getStoredConfig();
			if (!config.topics) config.topics = [];
			if (!config.unsubscribedTopics) config.unsubscribedTopics = [];

			if (config.unsubscribedTopics.indexOf(topic) !== -1) {
				return false;
			}

			this.unsubscribeFromTopic(topic).then(() => {
				config.unsubscribedTopics.push(topic);
				config.topics = config.topics.filter((myTopic: string) => myTopic !== topic);
				localStorage.setItem('push-notification-config', JSON.stringify(config));
			});

			return true;
		} catch (error) {
			console.error('Error unsubscribing from chat:', error);
			return false;
		}
	}
}
