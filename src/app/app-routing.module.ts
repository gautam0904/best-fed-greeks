import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'welcome',
		pathMatch: 'full'
	},
	{
		path: 'account',
		loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
	},
	{
		path: 'login',
		loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
	},
	{
		path: 'register',
		loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule)
	},
	{
		path: 'profile',
		loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
	},
	{
		path: 'week-menu',
		redirectTo: 'week-menu/'
	},
	{
		path: 'week-menu/:houseId',
		loadChildren: () => import('./pages/week-menu/week-menu.module').then(m => m.WeekMenuPageModule)
	},
	{
		path: 'day-menu/:date/:mealType',
		loadChildren: () => import('./pages/day-menu/day-menu.module').then(m => m.DayMenuPageModule)
	},
	{
		path: 'day-menu/:date/:mealType/:houseId',
		loadChildren: () => import('./pages/day-menu/day-menu.module').then(m => m.DayMenuPageModule)
	},
	// { 
	// 	path: 'meal-plan', 
	// 	loadChildren: './pages/meal-plan/meal-plan.module#MealPlanPageModule' 
	// },
	{
		path: 'edit-meal-plan',
		loadChildren: () => import('./pages/edit-meal-plan/edit-meal-plan.module').then(m => m.EditMealPlanPageModule)
	},
	{
		path: 'requests',
		loadChildren: () => import('./pages/requests/requests.module').then(m => m.RequestsPageModule)
	},
	{
		path: 'chat-list',
		loadChildren: () => import('./pages/chat-list/chat-list.module').then(m => m.ChatListPageModule)
	},
	{
		path: 'chat/:houseId',
		loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule)
	},
	{
		path: 'chat',
		loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule)
	},
	{
		path: 'ratings',
		loadChildren: () => import('./pages/ratings/ratings.module').then(m => m.RatingsPageModule)
	},
	{
		path: 'chef-rating',
		loadChildren: () => import('./pages/chef-rating/chef-rating.module').then(m => m.ChefRatingPageModule)
	},
	{
		path: 'meal-rating',
		loadChildren: () => import('./pages/meal-rating/meal-rating.module').then(m => m.MealRatingPageModule)
	},
	{
		path: 'password-reset',
		loadChildren: () => import('./pages/password-reset/password-reset.module').then(m => m.PasswordResetPageModule)
	},
	{
		path: 'technical-support',
		loadChildren: () => import('./pages/technical-support/technical-support.module').then(m => m.TechnicalSupportPageModule)
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
	},
	{
		path: 'welcome',
		loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomePageModule)
	},

	// Backend routes
	{
		path: 'announcements',
		loadChildren: () => import('./pages/announcements/announcements.module').then(m => m.AnnouncementsPageModule)
	},
	{
		path: 'house-list',
		loadChildren: () => import('./pages/house-list/house-list.module').then(m => m.HouseListPageModule)
	},
	{
		path: 'house-dashboard/:houseId',
		loadChildren: () => import('./pages/house-dashboard/house-dashboard.module').then(m => m.HouseDashboardPageModule)
	},
	{
		path: 'house-roster/:houseId',
		loadChildren: () => import('./pages/house-roster/house-roster.module').then(m => m.HouseRosterPageModule)
	},
	{
		path: 'house-roster/:houseId/:date/:mealType',
		loadChildren: () => import('./pages/house-roster/house-roster.module').then(m => m.HouseRosterPageModule)
	},
	{
		path: 'house-menus',
		loadChildren: () => import('./pages/house-menus/house-menus.module').then(m => m.HouseMenusPageModule)
	},
	{
		path: 'house-menu-builder/list/:houseId',
		loadChildren: () => import('./pages/house-menu-builder/menu-list.module').then(m => m.MenuListModule)
	},
	{
		path: 'house-menu-builder/summary/:houseId/:date',
		loadChildren: () => import('./pages/house-menu-builder/menu-summary.module').then(m => m.MenuSummaryModule)
	},
	{
		path: 'house-menu-builder/edit/:houseId/:date',
		loadChildren: () => import('./pages/house-menu-builder/menu-edit.module').then(m => m.MenuEditModule)
	},
	{ path: '**', redirectTo: 'login' }
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
