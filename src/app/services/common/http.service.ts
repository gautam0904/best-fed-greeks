import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	constructor(private http: HttpClient) {}

	private get apiUrl() {
		return environment.apiUrl;
	}

	public post(endPoint:string, params:any, options:any={}): Observable<any> {
		return new Observable((observer) => {
			this.http.post(this.apiUrl + '/' + endPoint, params, options).subscribe({
				next: (data) => {
					observer.next(data);
				},
				error: (err) => {
					observer.error(err);
				},
				complete:()=>{
					observer.complete();
				}
			});
		});
	}
}