import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AllergiesComponent } from './forms/allergies/allergies.component';
import { DietComponent } from './forms/diet/diet.component';
import { MealDetailsComponent } from './meal-details/meal-details.component';
import { MenuStatusComponent } from './menu-status/menu-status.component';

import { Ionic4DatepickerModule } from './datepicker/ionic4-datepicker.module';

// https://angular.io/guide/frequent-ngmodules
@NgModule({
	declarations: [
		AllergiesComponent,
		DietComponent,
		MealDetailsComponent,
		MenuStatusComponent
	],

	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		Ionic4DatepickerModule,
		RouterModule
	],
	exports: [
		AllergiesComponent,
		DietComponent,
		MealDetailsComponent,
		Ionic4DatepickerModule,
		MenuStatusComponent
	],
	providers: [],
	bootstrap: []
})

export class ComponentsModule { }
