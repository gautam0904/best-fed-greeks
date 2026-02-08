import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from './common/http.service';

import { Observable, BehaviorSubject } from 'rxjs';

import { BFGPushNotificationService } from './bfg-push-notification.service';

@Injectable({
	providedIn: 'root',
})
export class BFGUserService {
	// will have access_token and other user information. Might be best to make an interface/model out of thise
	private _user: any;
	private _checkedStorage: boolean = false;
	private _currentHouseId: any = 0;
	private _houses: any = [];
	private _houseLocations = [];
	private _appFunctions: any = {};
	private _userConfigLoaded = new BehaviorSubject<boolean>(false);
	private _houseChanged = new BehaviorSubject<boolean>(false);
	private _isFetchingConfig: boolean = false;
	public userConfigLoaded = this._userConfigLoaded.asObservable();
	public houseChanged = this._houseChanged.asObservable();

	constructor(private http: HttpService, private router: Router, private push: BFGPushNotificationService) {
		// Clear any cached data on app start
		this.clearCachedData();
	}

	private clearCachedData() {
		try {
			// Clear any cached API responses
			if ('caches' in window) {
				caches.keys().then(cacheNames => {
					cacheNames.forEach(cacheName => {
						caches.delete(cacheName);
					});
				});
			}
			
			// Clear localStorage items that might contain old API URLs
			const keysToKeep = ['user', 'push-notification-config'];
			const allKeys = Object.keys(localStorage);
			allKeys.forEach(key => {
				if (!keysToKeep.includes(key)) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			console.warn('Error clearing cached data:', error);
		}
	}

	// Add missing methods that other parts of the app expect
	public get name(): string {
		try {
			return this._user ? this._user.name : '';
		} catch (error) {
			console.error('Error getting user name:', error);
			return '';
		}
	}

	public set name(value: string) {
		try {
			if (this._user) {
				this._user.name = value;
				localStorage.setItem('user', JSON.stringify(this._user));
			}
		} catch (error) {
			console.error('Error setting user name:', error);
		}
	}

	public get refreshToken(): string {
		try {
			return this._user ? this._user.refresh_token : '';
		} catch (error) {
			console.error('Error getting refresh token:', error);
			return '';
		}
	}

	public getId(): string {
		try {
			return this._user ? this._user.id : '';
		} catch (error) {
			console.error('Error getting user ID:', error);
			return '';
		}
	}

	public initializeHouses(): Observable<any> {
		return new Observable((observer) => {
			try {
				// This method is called by other components to initialize houses
				// The houses are already loaded in fetchUserConfig, so this is just a no-op
				console.log('Houses initialization requested');
				observer.next({});
				observer.complete();
			} catch (error) {
				console.error('Error initializing houses:', error);
				observer.error(error);
			}
		});
	}

	public register(userData: any): Observable<any> {
		return new Observable((observer) => {
			try {
				this.http.post('bfg/auth/register', userData).subscribe(
					(response) => {
						try {
							observer.next(response);
							observer.complete();
						} catch (error) {
							console.error('Error processing register response:', error);
							observer.error(error);
						}
					},
					(error) => {
						console.error('Register error:', error);
						observer.error(error);
					}
				);
			} catch (error) {
				console.error('Error in register method:', error);
				observer.error(error);
			}
		});
	}

	public fetchUser(): Observable<any> {
		return new Observable((observer) => {
			try {
				observer.next(this.getOrRestoreUser());
				observer.complete();
			} catch (error) {
				console.error('Error fetching user:', error);
				observer.error(error);
			}

			return () => {};
		});
	}

	public get user() {
		try {
			return this.getOrRestoreUser();
		} catch (error) {
			console.error('Error getting user:', error);
			return null;
		}
	}

	public loginMockUser() {
		try {
			this._user = {
				name:'Test User',
				house:'Delta Tau Delta',
				access_token:'not_a_secret'
			};

			localStorage.setItem('user', JSON.stringify(this._user));
		} catch (error) {
			console.error('Error setting mock user:', error);
		}
	}

	public setTokenFromResponse(token:string) {
		try {
			if (this._user) {
				this._user.access_token = token;
				localStorage.setItem('user', JSON.stringify(this._user));
			}
		} catch (error) {
			console.error('Error setting token:', error);
		}
	}

	public clearStoredUser() {
		try {
			if (this.push && typeof this.push.clear === 'function') {
				this.push.clear();
			}
			this._user = undefined;
			localStorage.removeItem('user');
		} catch (error) {
			console.error('Error clearing stored user:', error);
		}
	}

	public isAuthenticated(): boolean {
		try {
			let user = this._user;
			if(!this._checkedStorage) {
				user = this.getOrRestoreUser();
				this._checkedStorage = true;
			}
			return !!user;
		} catch (error) {
			console.error('Error checking authentication:', error);
			return false;
		}
	}

	private getOrRestoreUser() {
		try {
			if(!this._user && localStorage.getItem('user')) {
				this._user = JSON.parse(localStorage.getItem('user'));
			}

			if(!this._userConfigLoaded.value && !this._isFetchingConfig) {
				this._isFetchingConfig = true;
				this.fetchUserConfig().subscribe(() => {});
			}

			return this._user;
		} catch (error) {
			console.error('Error getting or restoring user:', error);
			return null;
		}
	}

	public appFunctionEnabled(func) {
		try {
			return !!this._appFunctions[func];
		} catch (error) {
			console.error('Error checking app function:', error);
			return false;
		}
	}

	public switchToHouse(houseId) {
		try {
			if(this.isStudent()) return;

			this._currentHouseId = houseId;
			let myHouse = null;
			for(let house of this.houses) {
				if(house.id == this._currentHouseId) {
					myHouse = house;
					break;
				}
			}

			// @todo set these from the houses config
		} catch (error) {
			console.error('Error switching house:', error);
		}
	}

	public get houses() {
		try {
			return this._houses;
		} catch (error) {
			console.error('Error getting houses:', error);
			return [];
		}
	}

	public get currentHouseId() {
		try {
			return this._currentHouseId;
		} catch (error) {
			console.error('Error getting current house ID:', error);
			return 0;
		}
	}

	public get houseLocations() {
		try {
			return this._houseLocations;
		} catch (error) {
			console.error('Error getting house locations:', error);
			return [];
		}
	}

	public isStudent(): boolean {
		try {
			return this._user && this._user.user_type === 'student';
		} catch (error) {
			console.error('Error checking if user is student:', error);
			return false;
		}
	}

	public isChef(): boolean {
		try {
			return this._user && this._user.user_type === 'chef';
		} catch (error) {
			console.error('Error checking if user is chef:', error);
			return false;
		}
	}

	public isSuperChef(): boolean {
		try {
			return this._user && this._user.user_type === 'super_chef';
		} catch (error) {
			console.error('Error checking if user is super chef:', error);
			return false;
		}
	}

	public login(username: string, password: string): Observable<any> {
		return new Observable((observer) => {
			try {
				// Force clear any cached data before login
				this.clearCachedData();
				
				this.http.post('auth/login', { login: username, password }).subscribe(
					(response) => {
						try {
							if (!response.error) {
								this._user = response.user;
								if (response.token) {
									this._user.access_token = response.token;
								}
								localStorage.setItem('user', JSON.stringify(this._user));
								this._checkedStorage = true;
							}
							observer.next(response);
							observer.complete();
						} catch (error) {
							console.error('Error processing login response:', error);
							observer.error(error);
						}
					},
					(error) => {
						console.error('Login error:', error);
						observer.error(error);
					}
				);
			} catch (error) {
				console.error('Error in login method:', error);
				observer.error(error);
			}
		});
	}

	public fetchUserConfig(): Observable<any> {
		return new Observable((observer) => {
			try {
				if (!this.isAuthenticated()) {
					this._userConfigLoaded.next(true);
					observer.next({});
					observer.complete();
					return;
				}

				this.http.post('bfg/user/config', {}).subscribe(
					(response) => {
						try {
							if (!response.error) {
								this._houses = response.houses || [];
								this._houseLocations = response.house_locations || [];
								this._appFunctions = response.app_functions || {};
								
								if (this._houses.length > 0 && !this._currentHouseId) {
									this._currentHouseId = this._houses[0].id;
								}
							}
							this._userConfigLoaded.next(true);
							observer.next(response);
							observer.complete();
						} catch (error) {
							console.error('Error processing user config response:', error);
							this._userConfigLoaded.next(true);
							observer.error(error);
						}
					},
					(error) => {
						console.error('User config error:', error);
						this._userConfigLoaded.next(true);
						observer.error(error);
					}
				);
			} catch (error) {
				console.error('Error in fetchUserConfig method:', error);
				this._userConfigLoaded.next(true);
				observer.error(error);
			}
		});
	}

	public logout(): void {
		try {
			this.clearStoredUser();
			this.router.navigateByUrl('/login');
		} catch (error) {
			console.error('Error during logout:', error);
		}
	}
}
