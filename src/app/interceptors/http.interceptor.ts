import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { HttpRequest, HttpResponse, HttpErrorResponse  } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable, of, from, throwError, AsyncSubject } from "rxjs";
import { tap, catchError, mergeMap } from "rxjs/operators";

import { MessageService } from '../services/common/message.service';
import { BFGUserService } from '../services/bfg-user.service';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
	private _justRefreshed:boolean = false;

	constructor(
		public toast: ToastController,
		public bfgUser: BFGUserService,
		public router: Router,
		private msg: MessageService
	) {
	}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return this.handleAccess(request, next);
	}

	private handleAccess(request: HttpRequest<any>, next: HttpHandler):
	Observable<HttpEvent<any>> {
		return this.bfgUser.fetchUser().pipe(
			mergeMap((user) => {
				let changedRequest = this.getTokenRequest(user, request),
					hasToken = user && user.access_token,
					refreshTried = false,
					isRefresh = changedRequest.url.indexOf('refresh-token') != -1;

				if(isRefresh) {
					this._justRefreshed = true;
				}

				const subject = new AsyncSubject<HttpEvent<any>>();

				next.handle(changedRequest).pipe(
		            tap(async evt => {
		            	this.handleSuccess(evt, subject, isRefresh);
		            }, async (err) => {
		            	await this.handleError(changedRequest, next, subject, user, err);
		            })
	            ).subscribe();

				return subject;
			})
		);
	}

	private handleSuccess(evt:any, subject: AsyncSubject<HttpEvent<any>>, isRefresh:boolean=false): void {
		if (!(evt instanceof HttpResponse)) {
			return;
		}

        if(evt.body && evt.body.success) {
     	}

     	if(evt.body) {
     		evt.body.error = false;
     	}

     	if(evt.headers.has('Authorization')) {
     		let authHeader = evt.headers.get('Authorization'),
     			authToken = authHeader.replace('Bearer', '').trim();

     		this.bfgUser.setTokenFromResponse(authToken);
     		this.bfgUser.fetchUserConfig().subscribe();
     	}

     	if(!isRefresh) {
     		this._justRefreshed = false;
     	}

     	subject.next(evt);
     	subject.complete();
	}

	private async handleError(
		request: HttpRequest<any>, next: HttpHandler, subject: AsyncSubject<HttpEvent<any>>,
		user:any, err:any, refresh:boolean = false
	) : Promise<any> {
		if(!(err instanceof HttpErrorResponse)) {
			return Promise.resolve();
		}

		let hasToken = user && user.access_token;
console.log('hasToken', hasToken);
		const errorEvent = new HttpResponse({
			body: {
				error:true,
				message: err.error.message,
				status: err.status,
				statusText: err.statusText
			}
		}),
		isLogin = request.url.indexOf('auth/login') != -1,
		isRefresh = request.url.indexOf('auth/refresh-token') != -1,
		isRegister = request.url.indexOf('auth/register') != -1,
		isForgotPassword = request.url.indexOf('auth/forgot-password') != -1;

console.log('HttpErrorResponse', err);
		let header = isLogin ? 'Unable To Login' : 'Authentication Error',
			message = '',
			authenticationError = false,
			serverError = false;

		switch(err.status) {
			case 403:
			case 401:
				authenticationError = true;
				message = isLogin ? 
					'Please make sure you have entered your login/password correctly.' :
					'Access not verified, please try logging in.';

				if(err && err.error && typeof err.error.error == 'string' && err.error.error == 'user_inactive') {
					message = 'Please make sure you have activated your account.';
				}
			break;
			case 422:
				authenticationError = true;
				let errors = err.error && err.error.errors ? err.error.errors : {};
				let messages = [].concat(
					errors.login ? errors.login : [],
					errors.password ? errors.password : []
				);
				message = messages.length > 0 ? 
					'<ul><li>' + messages.join('</li><li>') + '</li></ul>' :
					'Make sure you have registered and successfully activated your account';
			break;
			case 500:
				serverError = true;
			break;
			default:
				header = 'Unknown Error';
				message = 'Unable to complete request. Please contact support if this continues.';
			break;
		}

		let needMessage = false,
			redirectToLogin = false;

		if(isRefresh && (authenticationError || serverError)) {
			needMessage = true;
			redirectToLogin = true;
			message = "Could not authenticate. Please try logging in again";
			this.bfgUser.clearStoredUser();
			this.msg.hideLoader();
		}
		else if((isLogin || isForgotPassword) && authenticationError) {
			needMessage = true;
		}
		else if(isRegister && authenticationError) {
			let errors = err.error && err.error.errors ? err.error.errors : {};
			let messages = [].concat(
				errors.login ? errors.login : [],
				errors.password ? errors.password : [],
				errors.email ? errors.email : []
			);
			errorEvent.body.message = messages.length > 0 ? 
					'<ul><li>' + messages.join('</li><li>') + '</li></ul>' :
					'Make sure you have correctly filled out each field to register successfully.';
		}
		else if(authenticationError && hasToken && !refresh && !this._justRefreshed) {
			// Try to get refreshToken and replay our original request.
			// Has to be a simpler less nested way of doing this.
			// Will investigate later.
			const refreshToken = this.bfgUser.refreshToken;
			if (refreshToken) {
				// For now, just redirect to login since refresh token logic is complex
				this.bfgUser.clearStoredUser();
				this.router.navigateByUrl('login');
			} else {
				redirectToLogin = true;
			}
		}
		else if(authenticationError) {
			redirectToLogin = (refresh || this._justRefreshed) || !hasToken ? true : false;
		}

		// Either way, if error it means refresh failed or the original request failed. So just reset.
		this._justRefreshed = false;

		if(needMessage) {
			let toast = await this.toast.create({
				header:header,
				message: message,
				position:'bottom',
				duration:5000,
				buttons: [{
					text: 'Close',
					role: 'cancel'
		        }]
			});
			await toast.present();
		}
        //log error 

        subject.next(errorEvent);
        subject.complete();

        if(redirectToLogin) {
        	this.bfgUser.clearStoredUser();
        	this.router.navigateByUrl('login');
        }

        return Promise.resolve();
	}

	private getTokenRequest(user:any, request: HttpRequest<any>, refreshed:boolean = false): HttpRequest<any> {
		const headerSettings: {[name: string]: string | string[]; } = {};

		for (const key of request.headers.keys()) {
			headerSettings[key] = request.headers.getAll(key);
		}

		if (user && user.access_token) {
			headerSettings['Authorization'] = 'Bearer ' + user.access_token;
		}

		headerSettings['Content-Type'] = 'application/json';
		const newHeader = new HttpHeaders(headerSettings);

		return request.clone({
			headers: newHeader
		});
	}
}
