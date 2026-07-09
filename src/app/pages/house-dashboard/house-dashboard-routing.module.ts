import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HouseDashboardPage } from './house-dashboard.page';

const routes: Routes = [
	{
		path: '',
		component: HouseDashboardPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HouseDashboardPageRoutingModule { }
