import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-allergies',
	templateUrl: './allergies.component.html',
	styleUrls: ['./allergies.component.scss'],
})
export class AllergiesComponent implements OnInit {
	@Input()
	public allergies = [];

	constructor() {}
	ngOnInit() {}
}