import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: false,
	selector: 'app-diet',
	templateUrl: './diet.component.html',
	styleUrls: ['./diet.component.scss'],
})
export class DietComponent implements OnInit {
	@Input()
	public diet = [];

	constructor() { }

	ngOnInit() {}

}
