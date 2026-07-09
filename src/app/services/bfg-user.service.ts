import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from './common/http.service';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

	constructor(private http: HttpService, private router: Router, private push: BFGPushNotificationService) {}

	public fetchUser(): Observable<any> {
		return new Observable((observer) => {
			observer.next(this.getOrRestoreUser());
			observer.complete();

			return () => {};
		});
	}

	public get user() {
		return this.getOrRestoreUser();
	}

	public loginMockUser() {
		this._user = {
			name:'Test User',
			house:'Delta Tau Delta',
			access_token:'not_a_secret'
		};

		localStorage.setItem('user', JSON.stringify(this._user));
	}

	public setTokenFromResponse(token:string) {
		this._user.access_token = token;
		localStorage.setItem('user', JSON.stringify(this._user));
	}

	public clearStoredUser() {
		this.push.clear();
		this._user = undefined;
		localStorage.removeItem('user');
	}

	public isAuthenticated(): boolean {
		let user = this._user;
		if(!this._checkedStorage) {
			user = this.getOrRestoreUser();
			this._checkedStorage = true;
		}
		return !!user;
	}

	private getOrRestoreUser() {
		if(!this._user && localStorage.getItem('user')) {
			this._user = JSON.parse(localStorage.getItem('user'));
		}

		// Only fetch config if user is logged in and config hasn't been loaded yet
		if(this._user && !this._userConfigLoaded.value && !this._isFetchingConfig) {
			this._isFetchingConfig = true;
			this.fetchUserConfig().subscribe(() => {}, () => {
				this._isFetchingConfig = false;
			});
		}

		return this._user;
	}

	public appFunctionEnabled(func) {
		return !!this._appFunctions[func];
	}

	public switchToHouse(houseId) {
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
		this._appFunctions = myHouse && myHouse.enabled_app_functions ? myHouse.enabled_app_functions : {};
		this._houseChanged.next(true);
	}

	public login(username:string, password:string): Observable<any> {
		return new Observable((observer) => {
			this.http.post('auth/login', { login: username, password: password }).subscribe(async response => {
				if(response.user) {
					this._user = response.user;
					this._user.access_token = response.token;
					localStorage.setItem('user', JSON.stringify(this._user));
					await this.fetchUserConfig().toPromise();
				}

				observer.next(response);
				observer.complete();
			});
		});
	}

	public logout() {
		this.clearStoredUser();
		this._houses = [];
		this._houseChanged.next(false);
		this._userConfigLoaded.next(false);
		this._currentHouseId = 0;
		this._appFunctions = {};
		this._isFetchingConfig = false;
		this._checkedStorage = false;
		this.router.navigateByUrl('/login');
	}

	public isStudent(): boolean {
		let isStudent = false;
		if(this._user) {
			isStudent = !this._user.role_id; // Default to student this way! They aren't backend
		}

		return isStudent;
	}

	public isChef(): boolean {
		let isChef = false;

		if(this._user) {
			isChef = this._user.role && this._user.role.code == 'chef';
		}

		return isChef;
	}

	public isSuperChef(): boolean {
		let isSuperChef = false;

		if(this._user) {
			isSuperChef = this._user.role && (this._user.role.code == 'super-chef' || this._user.role.code == 'super-chef-admin');
		}

		return isSuperChef;
	}

	public getId(): any {
		return this._user ? this._user.id : 0;
	}

	public get houses(): any {
		return this._houses;
	}

	// Useful for chefs and detcting when to use back buttons or not
	public set houses(houses:any) {
		this._houses = houses;
	}

	public get houseLocations(): any {
		return this._houseLocations;
	}

	// Useful for chefs and detcting when to use back buttons or not
	public set houseLocations(houseLocations:any) {
		this._houseLocations = houseLocations;
	}

	public get name() {
		let name = '';

		if(this.isStudent()) {
			name = this.user.name;
		}
		else if(this.isChef() || this.isSuperChef()) {
			name = this.user.first_name + ' ' + this.user.last_name;
		}

		return name;
	}

	// Only for student changing name right now. Need more if allowing chef to change name in app
	public set name(name:string) {
		this.user.name = name;

		if(JSON.stringify(this._user)) {
			localStorage.setItem('user', JSON.stringify(this._user));
		}
	}

	public initializeHouses(): Observable<any> {
		if(this.isStudent()) {
			// Students do not need this. Simply ignore if called for some reason
			return new Observable((observer) => {
				observer.next(true);
				observer.complete();
			});
		}
		else {
			return new Observable((observer) => {
				if(this._houses.length > 0) {
					if(this._currentHouseId) {
						this.switchToHouse(this._currentHouseId);
					}

					observer.next(true);
					observer.complete();
					return;
				}

				// We have a specific registration route since we need an access code based of a house
				this.http.post('bfg/house-dashboard/load-houses', { }).subscribe(async response => {
					this.houses = response.houses;
					this.houseLocations = response.house_locations;

					if(this._currentHouseId) {
						this.switchToHouse(this._currentHouseId);
					}

					observer.next(true);
					observer.complete();
				});
			});
		}
	}

	public refreshToken(): Observable<any>  {
		return new Observable((observer) => {
			let user = this.getOrRestoreUser();

			if(user && user.access_token) {
				this.http.post('auth/refresh-token', { token: user.access_token}).subscribe(response => {
					if(response.token && this._user) {
						this._user.access_token = response.token;
						localStorage.setItem('user', JSON.stringify(this._user));
					}
					else if(this._user) {
						this._user.access_token = '';
						localStorage.setItem('user', JSON.stringify(this._user));
					}

					observer.next(this._user);
					observer.complete();
				});
			}
			else {
				observer.next();
				observer.complete();
			}
		});
	}

	public register(userInfo:any): Observable<any> {
		return new Observable((observer) => {
			// We have a specific registration route since we need an access code based of a house
			this.http.post('bfg/auth/register', userInfo).subscribe(async response => {
				observer.next(response);
				observer.complete();
			});
		});
	}

	public fetchUserConfig(): Observable<any> {
		return new Observable((observer) => {
			this.http.post('bfg/user/load-config', {}).pipe(
				catchError((err) => {
					console.warn('Could not load user config (API unreachable?):', err.status || err.message);
					this._isFetchingConfig = false;
					observer.next(null);
					observer.complete();
					return of(null);
				})
			).subscribe(response => {
				if(!response) return;

				if(response && response.push_notifications) {
					this.push.handlePushNotificationConfig(response.push_notifications);
				}

				if(response && response.enabled_app_functions) {
					this._appFunctions = response.enabled_app_functions;
				}

				observer.next(response);
				observer.complete();

				this._userConfigLoaded.next(true);
			});
		});
	}
}