import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HouseRosterPage } from './house-roster.page';

const routes: Routes = [
	{
		path: '',
		component: HouseRosterPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HouseRosterPageRoutingModule { }
