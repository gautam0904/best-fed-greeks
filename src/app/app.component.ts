import { Component } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { BFGUserService } from './services/bfg-user.service';
import { BFGPushNotificationService } from './services/bfg-push-notification.service';

@Component({
  standalone: false,
	selector: 'app-root',
	templateUrl: 'app.component.html'
})
export class AppComponent {
	public onWelcome: boolean = false;
	public showMenu: boolean = false;

	appPages = [
		// Chef/Super chef links
		{
			title: 'Announcements',
			url: '/announcements',
			icon: 'list-box',
			allowChef: true,
			allowSuperChef: true
		},
		{
			title: 'Houses',
			url: '/house-list',
			icon: 'home',
			allowChef: true,
			allowSuperChef: true
		},
		{
			title: 'House Menus',
			url: '/house-menus',
			icon: 'calendar',
			allowSuperChef: true
		},
		{
			title: 'Chat',
			url: '/chat-list',
			icon: 'chatboxes',
			allowChef: true,
			allowSuperChef: true,
			app_function_key: 'chat'
		},

		// Student links
		{
			title: 'Dashboard',
			url: '/dashboard',
			icon: 'speedometer',
			allowStudent: true
		},
		{
			title: 'Weekly Menu',
			url: '/week-menu',
			icon: 'book',
			allowStudent: true
		},
		{
			title: 'Edit Meal Plan',
			url: '/edit-meal-plan',
			icon: 'calendar',
			allowStudent: true
		},
		{
			title: 'Ratings',
			url: '/ratings',
			icon: 'star',
			allowStudent: true,
			app_function_key: ['meal_ratings', 'chef_ratings']
		},
		{
			title: 'Requests & Comments',
			url: '/requests',
			icon: 'clipboard',
			allowStudent: true,
			app_function_key: 'request_comments'
		},
		{
			title: 'Chat',
			url: '/chat',
			icon: 'chatboxes',
			allowStudent: true,
			app_function_key: 'chat'
		},
		{
			title: 'Profile',
			url: '/profile',
			icon: 'settings',
			allowStudent: true
		},
		{
			title: 'Technical Support',
			url: '/technical-support',
			icon: 'information-circle',
			alwaysAvailable: true
		},
		{
			title: 'Login',
			url: '/login',
			icon: 'calendar',
			publicOnly: true
		}
	];

	constructor(
		public bfgUser: BFGUserService,
		public push: BFGPushNotificationService,
		private platform: Platform,
		private router: Router,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar
	) {
		this.router.events.subscribe((event: Event) => {
			if (event instanceof NavigationEnd) {
				this.onWelcome = event.urlAfterRedirects == '/welcome';
				// Hide loading indicator
			}
		});
	}

	ngOnInit() {
		this.initializeApp();
	}

	private clearAllCaches() {
		try {
			// Clear browser caches
			if ('caches' in window) {
				caches.keys().then(cacheNames => {
					cacheNames.forEach(cacheName => {
						caches.delete(cacheName);
					});
				});
			}

			// Clear service worker caches
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.getRegistrations().then(registrations => {
					registrations.forEach(registration => {
						registration.unregister();
					});
				});
			}

			// Clear localStorage except essential items
			const keysToKeep = ['user', 'push-notification-config'];
			const allKeys = Object.keys(localStorage);
			allKeys.forEach(key => {
				if (!keysToKeep.includes(key)) {
					localStorage.removeItem(key);
				}
			});

			// Clear sessionStorage
			sessionStorage.clear();

			console.log('All caches cleared successfully');
		} catch (error) {
			console.warn('Error clearing caches:', error);
		}
	}

	initializeApp() {
		console.log('Initializing app');

		// Clear all caches on app start
		this.clearAllCaches();

		// Add error handling for platform ready
		this.platform.ready().then(() => {
			console.log('Platform ready');

			// Handle back button with error handling
			try {
				this.platform.backButton.subscribeWithPriority(9999, () => {
					// Do nothing
				});
			} catch (error) {
				console.warn('Back button handler not available:', error);
			}

			// Handle document back button with error handling
			try {
				document.addEventListener("backbutton", function (e) {
					e.preventDefault();
				}, false);
			} catch (error) {
				console.warn('Document back button handler not available:', error);
			}

			// Handle StatusBar with error handling
			try {
				if (this.statusBar && typeof this.statusBar.styleDefault === 'function') {
					this.statusBar.styleDefault();
				}
			} catch (error) {
				console.warn('StatusBar plugin not available:', error);
			}

			// Handle SplashScreen with error handling
			try {
				if (this.splashScreen && typeof this.splashScreen.hide === 'function') {
					this.splashScreen.hide();
				}
			} catch (error) {
				console.warn('SplashScreen plugin not available:', error);
			}

			console.log('Platform ready');

			// Initialize push notifications with error handling
			// if (this.push && typeof this.push.init === 'function') {
				// this.push.init().then((success) => {
					// console.log('Push notifications initialized:', success);
				// }).catch((error) => {
					// console.warn('Push notifications failed to initialize:', error);
					// Continue app initialization even if push notifications fail
				// });
			// } else {
				// console.warn('Push notification service not available');
			// }
		})
			.catch((err) => {
				console.error('Platform initialization failed:', err);
				console.log('Platform not ready');

				// Try to hide splash screen even if platform is not ready
				try {
					if (this.splashScreen && typeof this.splashScreen.hide === 'function') {
						this.splashScreen.hide();
					}
				} catch (error) {
					console.warn('Could not hide splash screen:', error);
				}
			});
	}

	public isDesktop() {
		try {
			return this.platform.is('desktop') || this.platform.is('mobileweb');
		} catch (error) {
			console.warn('Platform check failed:', error);
			return false;
		}
	}

	public showMenuItem(page: any) {
		if (!this.bfgUser) return false;

		var me = this;

		let p = page,
			authenticated = this.bfgUser.isAuthenticated();

		var
			showMenuItem = false,
			origShowMenuItem = (authenticated && p.requireAuthentication) || (!authenticated && p.publicOnly) || p.alwaysAvailable;

		showMenuItem = origShowMenuItem;

		if (page.allowStudent && !showMenuItem) {
			showMenuItem = this.bfgUser.isStudent();
		}

		if (page.allowChef && !showMenuItem) {
			showMenuItem = this.bfgUser.isChef();
		}

		if (page.allowSuperChef && !showMenuItem) {
			showMenuItem = this.bfgUser.isSuperChef();
		}

		if (showMenuItem && this.isStudent() && page.app_function_key) {
			var funcKeys = Array.isArray(page.app_function_key) ? page.app_function_key : [page.app_function_key];
			var enable = false;
			funcKeys.forEach(function (val) {
				enable = me.bfgUser.appFunctionEnabled(val) || enable;
			});

			showMenuItem = enable;
		}

		return showMenuItem;
	}

	public isStudent() {
		try {
			return this.bfgUser.isStudent();
		} catch (error) {
			console.warn('Student check failed:', error);
			return false;
		}
	}

	public isChef() {
		try {
			return this.bfgUser.isChef();
		} catch (error) {
			console.warn('Chef check failed:', error);
			return false;
		}
	}

	public isSuperChef() {
		try {
			return this.bfgUser.isSuperChef();
		} catch (error) {
			console.warn('SuperChef check failed:', error);
			return false;
		}
	}

	public showLogout() {
		try {
			let authenticated = this.bfgUser.isAuthenticated();
			return authenticated;
		} catch (error) {
			console.warn('Authentication check failed:', error);
			return false;
		}
	}
}
