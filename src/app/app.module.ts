import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Push } from '@awesome-cordova-plugins/push/ngx';

import { CustomHttpInterceptor } from './interceptors/http.interceptor';
import { ErrorHandlerService } from './services/common/error-handler.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		IonicModule.forRoot(),
		AppRoutingModule
	],
	providers: [
		{
			provide: StatusBar,
			useFactory: () => {
				try {
					return new StatusBar();
				} catch (error) {
					console.warn('StatusBar provider not available:', error);
					return null;
				}
			}
		},
		{
			provide: SplashScreen,
			useFactory: () => {
				try {
					return new SplashScreen();
				} catch (error) {
					console.warn('SplashScreen provider not available:', error);
					return null;
				}
			}
		},
		{
			provide: Push,
			useFactory: () => {
				try {
					return new Push();
				} catch (error) {
					console.warn('Push provider not available:', error);
					return null;
				}
			}
		},
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: CustomHttpInterceptor,
			multi: true
		},
		ErrorHandlerService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
