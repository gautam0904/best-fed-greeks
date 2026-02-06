import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: false,
	selector: 'app-menu-status',
	templateUrl: './menu-status.component.html',
	styleUrls: ['./menu-status.component.scss'],
})
export class MenuStatusComponent implements OnInit {
	@Input()
	public status = '';

	@Input()
	public cls = 'light';

	constructor(
	) {}

	ngOnInit() {}

	public get myCls() {
		return this.cls + ' ' + this.status.replace(' ', '-').toLowerCase();
	}

	public get iconColor() {
		if(this.status == 'In Progress') {
			return 'secondary';
		}
		else if(this.status == 'Submitted') {
			return 'primary';
		}
		else if(this.status == 'Changes Needed') {
			return 'danger';
		}
		else if(this.status == 'Approved') {
			return 'success';
		}
		else {
			return 'primary';
		}
	}
}
