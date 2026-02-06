import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditMealPlanPage } from './edit-meal-plan.page';

const routes: Routes = [
	{
		path: '',
		component: EditMealPlanPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EditMealPlanPageRoutingModule { }
