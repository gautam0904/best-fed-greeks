import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MealRatingPage } from './meal-rating.page';

const routes: Routes = [
	{
		path: '',
		component: MealRatingPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MealRatingPageRoutingModule { }
