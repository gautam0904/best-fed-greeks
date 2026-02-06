import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TechnicalSupportPage } from './technical-support.page';

const routes: Routes = [
	{
		path: '',
		component: TechnicalSupportPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TechnicalSupportPageRoutingModule { }
