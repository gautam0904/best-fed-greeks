import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChefRatingPage } from './chef-rating.page';

const routes: Routes = [
	{
		path: '',
		component: ChefRatingPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ChefRatingPageRoutingModule { }
