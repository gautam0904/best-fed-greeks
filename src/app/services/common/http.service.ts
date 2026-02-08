import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Observable, throwError, from } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';

import { NetworkService } from './network.service';
import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	private apiUrl = environment.apiUrl;
	private isNativePlatform = Capacitor.isNativePlatform();

	constructor(
		private http: HttpClient,
		private networkService: NetworkService
	) {
		// Log the API URL and platform being used
		console.log('HTTP Service initialized with API URL:', this.apiUrl);
		console.log('Running on native platform:', this.isNativePlatform);
	}

	private getFullUrl(endPoint: string): string {
		const prefix = environment.apiPrefix || '';
		const fullUrl = this.apiUrl + '/' + prefix + endPoint;
		console.log('Making direct API request to:', fullUrl);
		return fullUrl;
	}

	private async retryWithoutCorsProxy(endPoint: string, params: any, options: any, isPost: boolean = true): Promise<any> {
		// If CORS proxy failed, try without it
		if (environment.useCorsProxy) {
			console.log('CORS proxy failed, retrying without proxy...');
			const directUrl = this.apiUrl + '/' + endPoint;

			const directOptions = {
				...options,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					...options.headers
				}
			};

			return new Promise((resolve, reject) => {
				const request = isPost ?
					this.http.post(directUrl, params, directOptions) :
					this.http.get(directUrl, directOptions);

				request.pipe(
					timeout(30000),
					catchError(this.handleError.bind(this))
				).subscribe({
					next: (response) => {
						console.log('Direct request successful:', directUrl);
						resolve(response);
					},
					error: (error) => {
						console.error('Direct request also failed:', error);
						reject(error);
					}
				});
			});
		}

		throw new Error('CORS proxy not available and direct request failed');
	}

	public post(endPoint: string, params: any, options: any = {}): Observable<any> {
		// Check network connectivity first
		if (!this.networkService.isNetworkAvailable()) {
			return throwError(() => new Error(this.networkService.getNetworkErrorMessage()));
		}

		const fullUrl = this.getFullUrl(endPoint);
		console.log('Making POST request to:', fullUrl);

		// Use native HTTP on mobile platforms to bypass CORS
		if (this.isNativePlatform) {
			console.log('Using Capacitor native HTTP for POST request');

			const userStr = localStorage.getItem('user');
			let authHeader = {};
			if (userStr) {
				try {
					const user = JSON.parse(userStr);
					if (user && user.access_token) {
						authHeader = { 'Authorization': 'Bearer ' + user.access_token };
					}
				} catch (e) {
					console.error('Error parsing user for auth header', e);
				}
			}

			const nativeOptions = {
				url: fullUrl,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					...authHeader,
					...options.headers
				},
				data: params
			};

			return from(CapacitorHttp.post(nativeOptions)).pipe(
				timeout(30000),
				map((response: HttpResponse) => {
					console.log('Native POST response from:', fullUrl, response.data);
					return response.data;
				}),
				catchError((error) => {
					console.error('Native HTTP Error for:', fullUrl, error);
					return this.handleError(error);
				})
			);
		}

		// Fallback to Angular HttpClient for web
		const corsOptions = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				...options.headers
			}
		};

		return new Observable((observer) => {
			try {
				this.http.post(fullUrl, params, corsOptions)
					.pipe(
						timeout(30000), // 30 second timeout
						catchError(this.handleError.bind(this))
					)
					.subscribe({
						next: (response) => {
							try {
								console.log('POST response from:', fullUrl, response);
								observer.next(response);
								observer.complete();
							} catch (error) {
								console.error('Error in post response handler:', error);
								observer.error(error);
							}
						},
						error: (error) => {
							console.error('HTTP Error for:', fullUrl, error);
							observer.error(error);
						}
					});
			} catch (error) {
				console.error('Error in post method:', error);
				observer.error(error);
			}
		});
	}

	public get(endPoint: string, options: any = {}): Observable<any> {
		// Check network connectivity first
		if (!this.networkService.isNetworkAvailable()) {
			return throwError(() => new Error(this.networkService.getNetworkErrorMessage()));
		}

		const fullUrl = this.getFullUrl(endPoint);
		console.log('Making GET request to:', fullUrl);

		// Use native HTTP on mobile platforms to bypass CORS
		if (this.isNativePlatform) {
			console.log('Using Capacitor native HTTP for GET request');

			const userStr = localStorage.getItem('user');
			let authHeader = {};
			if (userStr) {
				try {
					const user = JSON.parse(userStr);
					if (user && user.access_token) {
						authHeader = { 'Authorization': 'Bearer ' + user.access_token };
					}
				} catch (e) {
					console.error('Error parsing user for auth header', e);
				}
			}

			const nativeOptions = {
				url: fullUrl,
				headers: {
					'Accept': 'application/json',
					...authHeader,
					...options.headers
				}
			};

			return from(CapacitorHttp.get(nativeOptions)).pipe(
				timeout(30000),
				map((response: HttpResponse) => {
					console.log('Native GET response from:', fullUrl, response.data);
					return response.data;
				}),
				catchError((error) => {
					console.error('Native HTTP Error for:', fullUrl, error);
					return this.handleError(error);
				})
			);
		}

		// Fallback to Angular HttpClient for web
		const corsOptions = {
			...options,
			headers: {
				'Accept': 'application/json',
				...options.headers
			}
		};

		return new Observable((observer) => {
			try {
				this.http.get(fullUrl, corsOptions)
					.pipe(
						timeout(30000), // 30 second timeout
						catchError(this.handleError.bind(this))
					)
					.subscribe({
						next: (response) => {
							try {
								console.log('GET response from:', fullUrl, response);
								observer.next(response);
								observer.complete();
							} catch (error) {
								console.error('Error in get response handler:', error);
								observer.error(error);
							}
						},
						error: (error) => {
							console.error('HTTP Error for:', fullUrl, error);
							observer.error(error);
						}
					});
			} catch (error) {
				console.error('Error in get method:', error);
				observer.error(error);
			}
		});
	}

	private handleError(error: HttpErrorResponse) {
		let errorMessage = 'An error occurred';

		try {
			if (error.error instanceof ErrorEvent) {
				// Client-side error
				errorMessage = `Client Error: ${error.error.message}`;
			} else {
				// Server-side error
				if (error.status === 0) {
					// This is likely a network connectivity issue
					if (error.message && error.message.includes('CORS')) {
						errorMessage = 'CORS Error: The server is not allowing cross-origin requests. Please contact the server administrator to enable CORS for this app.';
					} else if (error.message && error.message.includes('timeout')) {
						errorMessage = 'Network Timeout: The request took too long to complete. Please check your internet connection.';
					} else if (error.message && error.message.includes('Unknown Error')) {
						errorMessage = 'Network Error: Unable to connect to the server. Please check:\n1. Your internet connection\n2. The server is running\n3. The API URL is correct';
					} else {
						errorMessage = this.networkService.getNetworkErrorMessage();
					}
				} else if (error.status === 403) {
					errorMessage = 'Access Forbidden: The server is blocking this request. This may be due to CORS policy restrictions.';
				} else if (error.status === 404) {
					errorMessage = 'API Endpoint Not Found: The requested API endpoint does not exist.';
				} else if (error.status === 500) {
					errorMessage = 'Server Error: The server encountered an internal error. Please try again later.';
				} else if (error.status === 401) {
					errorMessage = 'Unauthorized: Please check your login credentials.';
				} else {
					errorMessage = `Server Error: ${error.status} - ${error.message}`;
				}
			}

			console.error('HTTP Error Details:', {
				status: error.status,
				statusText: error.statusText,
				url: error.url,
				message: errorMessage,
				error: error.error,
				corsError: error.message && error.message.includes('CORS'),
				networkError: error.status === 0,
				timestamp: new Date().toISOString()
			});
		} catch (error) {
			console.error('Error in handleError method:', error);
			errorMessage = 'An unexpected error occurred';
		}

		return throwError(() => new Error(errorMessage));
	}
}
