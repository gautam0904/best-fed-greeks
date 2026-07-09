import { Component } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { BFGUserService } from './services/bfg-user.service';
import { BFGPushNotificationService } from './services/bfg-push-notification.service';

@Component({
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
			allowChef:true,
			allowSuperChef:true
		},
		{
			title: 'Houses',
			url: '/house-list',
			icon: 'home',
			allowChef:true,
			allowSuperChef:true
		},
		{
			title: 'House Menus',
			url: '/house-menus',
			icon: 'calendar',
			allowSuperChef:true
		},
		{
			title: 'Chat',
			url: '/chat-list',
			icon: 'chatboxes',
			allowChef:true,
			allowSuperChef:true,
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
			allowStudent:true,
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
			title:'Login',
			url: '/login',
			icon: 'calendar',
			publicOnly:true
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

	initializeApp() {
console.log('Initializing app');
		this.platform.ready().then(() => {
			console.log('Platform ready');
			this.platform.backButton.subscribeWithPriority(9999, () => {
			  // Do nothing
			});

			document.addEventListener("backbutton",function(e) {
		      e.preventDefault();
		    }, false);

			this.statusBar.styleDefault();
			this.splashScreen.hide();
console.log('Platform ready');
			this.push.init();
		})
		.catch((err) => {
			console.log(err);
			console.log('Platform not ready');
		});
	}

	public isDesktop() {
		return this.platform.is('desktop') || this.platform.is('mobileweb');
	}

	public showMenuItem(page:any) {
		if(!this.bfgUser) return false;

		var me = this;

		let p = page,
			authenticated = this.bfgUser.isAuthenticated();

		var 
			showMenuItem = false,
			origShowMenuItem = (authenticated && p.requireAuthentication) || (!authenticated && p.publicOnly) || p.alwaysAvailable;

		showMenuItem = origShowMenuItem;

		if(page.allowStudent && !showMenuItem) {
			showMenuItem = this.bfgUser.isStudent();
		}

		if(page.allowChef && !showMenuItem) {
			showMenuItem = this.bfgUser.isChef();
		}

		if(page.allowSuperChef && !showMenuItem) {
			showMenuItem = this.bfgUser.isSuperChef();
		}

		if(showMenuItem && this.isStudent() && page.app_function_key) {
			var funcKeys = Array.isArray(page.app_function_key) ? page.app_function_key : [page.app_function_key];
			var enable = false;
			funcKeys.forEach(function(val) {
				enable = me.bfgUser.appFunctionEnabled(val) || enable;
			});

			showMenuItem = enable;
		}

		return showMenuItem;
	}

	public isStudent() {
		return this.bfgUser.isStudent();
	}

	public isChef() {
		return this.bfgUser.isChef();
	}

	public isSuperChef() {
		return this.bfgUser.isSuperChef();
	}

	public showLogout() {
		let authenticated = this.bfgUser.isAuthenticated();
		return authenticated;
	}
}
