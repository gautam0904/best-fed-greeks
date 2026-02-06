import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
	providedIn: 'root',
})
export class NetworkService {
	private isOnline: boolean = true;

	constructor(private platform: Platform) {
		this.initializeNetworkMonitoring();
	}

	private initializeNetworkMonitoring() {
		try {
			// Monitor online/offline status
			window.addEventListener('online', () => {
				this.isOnline = true;
				console.log('Network: Online');
			});

			window.addEventListener('offline', () => {
				this.isOnline = false;
				console.log('Network: Offline');
			});

			// Check initial status
			this.isOnline = navigator.onLine;
		} catch (error) {
			console.warn('Error initializing network monitoring:', error);
			this.isOnline = true; // Default to online
		}
	}

	public isNetworkAvailable(): boolean {
		try {
			return this.isOnline;
		} catch (error) {
			console.warn('Error checking network availability:', error);
			return true; // Default to available
		}
	}

	public async checkConnectivity(): Promise<boolean> {
		try {
			if (!this.isOnline) {
				return false;
			}

			// Try to fetch a small resource to test connectivity
			const response = await fetch('https://www.google.com/favicon.ico', {
				method: 'HEAD',
				mode: 'no-cors',
				cache: 'no-cache'
			});
			return true;
		} catch (error) {
			console.warn('Connectivity check failed:', error);
			return false;
		}
	}

	public getNetworkErrorMessage(): string {
		try {
			if (!this.isOnline) {
				return 'No internet connection. Please check your network settings.';
			}
			return 'Unable to connect to server. Please check your internet connection.';
		} catch (error) {
			console.warn('Error getting network error message:', error);
			return 'Network error occurred. Please try again.';
		}
	}
}
