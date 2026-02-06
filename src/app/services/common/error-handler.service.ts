import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class ErrorHandlerService {
	private errorCount = 0;
	private readonly MAX_ERRORS = 10;
	private readonly ERROR_RESET_INTERVAL = 60000; // 1 minute

	constructor(private router: Router) {
		this.setupGlobalErrorHandling();
	}

	private setupGlobalErrorHandling() {
		// Handle unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			console.error('Unhandled promise rejection:', event.reason);
			this.handleError(event.reason, 'Unhandled Promise Rejection');
			event.preventDefault();
		});

		// Handle global errors
		window.addEventListener('error', (event) => {
			console.error('Global error:', event.error);
			this.handleError(event.error, 'Global Error');
		});

		// Handle Angular errors
		window.addEventListener('error', (event) => {
			if (event.error && event.error.message) {
				console.error('Angular error:', event.error);
				this.handleError(event.error, 'Angular Error');
			}
		});

		// Reset error count periodically
		setInterval(() => {
			this.errorCount = 0;
		}, this.ERROR_RESET_INTERVAL);
	}

	public handleError(error: any, context: string = 'Application Error') {
		try {
			this.errorCount++;

			// Log the error
			console.error(`${context}:`, error);

			// If too many errors, show a general error message
			if (this.errorCount > this.MAX_ERRORS) {
				this.showGeneralErrorMessage();
				return;
			}

			// Handle specific error types
			if (error && error.message) {
				if (error.message.includes('Network') || error.message.includes('connection')) {
					this.showNetworkErrorMessage();
				} else if (error.message.includes('authentication') || error.message.includes('token')) {
					this.handleAuthenticationError();
				} else if (error.message.includes('permission') || error.message.includes('access')) {
					this.showPermissionErrorMessage();
				} else {
					this.showGeneralErrorMessage();
				}
			} else {
				this.showGeneralErrorMessage();
			}
		} catch (handlerError) {
			console.error('Error in error handler:', handlerError);
			this.showGeneralErrorMessage();
		}
	}

	private showNetworkErrorMessage() {
		try {
			this.showToast('Network Error', 'Please check your internet connection and try again.');
		} catch (error) {
			console.error('Error showing network message:', error);
		}
	}

	private showPermissionErrorMessage() {
		try {
			this.showToast('Permission Error', 'You do not have permission to perform this action.');
		} catch (error) {
			console.error('Error showing permission message:', error);
		}
	}

	private showGeneralErrorMessage() {
		try {
			this.showToast('Error', 'An unexpected error occurred. Please try again.');
		} catch (error) {
			console.error('Error showing general message:', error);
		}
	}

	private handleAuthenticationError() {
		try {
			// Clear any stored authentication data
			localStorage.removeItem('user');
			localStorage.removeItem('push-notification-config');
			
			// Navigate to login
			this.router.navigateByUrl('/login');
			
			this.showToast('Session Expired', 'Please log in again.');
		} catch (error) {
			console.error('Error handling authentication error:', error);
		}
	}

	private showToast(header: string, message: string) {
		try {
			// Create a simple toast notification
			const toast = document.createElement('div');
			toast.style.cssText = `
				position: fixed;
				top: 20px;
				right: 20px;
				background: #f44336;
				color: white;
				padding: 15px 20px;
				border-radius: 4px;
				z-index: 10000;
				font-family: Arial, sans-serif;
				max-width: 300px;
				box-shadow: 0 2px 10px rgba(0,0,0,0.3);
			`;
			toast.innerHTML = `
				<div style="font-weight: bold; margin-bottom: 5px;">${header}</div>
				<div>${message}</div>
			`;

			document.body.appendChild(toast);

			// Remove after 5 seconds
			setTimeout(() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
			}, 5000);
		} catch (error) {
			console.error('Error showing toast:', error);
		}
	}

	public wrapAsync<T>(promise: Promise<T>, context: string = 'Async Operation'): Promise<T> {
		return promise.catch(error => {
			this.handleError(error, context);
			throw error;
		});
	}

	public wrapObservable<T>(observable: any, context: string = 'Observable Operation'): any {
		return observable.pipe(
			// Add error handling to observable
			// This is a simplified version - in a real app you'd use RxJS operators
		);
	}
}
