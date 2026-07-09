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
		loadChildren: './pages/account/account.module#AccountModule'
	},
	{
		path: 'login',
		loadChildren: './pages/login/login.module#LoginModule'
	},
	{
		path: 'register',
		loadChildren: './pages/register/register.module#RegisterModule'
	},
    { 
    	path: 'profile', 
    	loadChildren: './pages/profile/profile.module#ProfilePageModule' 
    },
    {
    	path: 'week-menu',
    	redirectTo: 'week-menu/'
    },
	{ 
		path: 'week-menu/:houseId', 
		loadChildren: './pages/week-menu/week-menu.module#WeekMenuPageModule' 
	},
		{ 
		path: 'day-menu/:date/:mealType',
		loadChildren: './pages/day-menu/day-menu.module#DayMenuPageModule'
	},
	{ 
		path: 'day-menu/:date/:mealType/:houseId',
		loadChildren: './pages/day-menu/day-menu.module#DayMenuPageModule'
	},
	// { 
	// 	path: 'meal-plan', 
	// 	loadChildren: './pages/meal-plan/meal-plan.module#MealPlanPageModule' 
	// },
	{ 
		path: 'edit-meal-plan', 
		loadChildren: './pages/edit-meal-plan/edit-meal-plan.module#EditMealPlanPageModule' 
	},
	{ 
		path: 'requests', 
		loadChildren: './pages/requests/requests.module#RequestsPageModule' 
	},
	{
		path: 'chat-list', 
		loadChildren: './pages/chat-list/chat-list.module#ChatListPageModule' 
	},
	{
		path: 'chat/:houseId', 
		loadChildren: './pages/chat/chat.module#ChatPageModule' 
	},
	{
		path: 'chat', 
		loadChildren: './pages/chat/chat.module#ChatPageModule' 
	},
	{
		path: 'ratings', 
		loadChildren: './pages/ratings/ratings.module#RatingsPageModule' 
	},
	{ 
		path: 'chef-rating', 
		loadChildren: './pages/chef-rating/chef-rating.module#ChefRatingPageModule' 
	},
	{ 
		path: 'meal-rating', 
		loadChildren: './pages/meal-rating/meal-rating.module#MealRatingPageModule' 
	},
	{ 
		path: 'password-reset', 
		loadChildren: './pages/password-reset/password-reset.module#PasswordResetPageModule' 
	},
	{ 
		path: 'technical-support', 
		loadChildren: './pages/technical-support/technical-support.module#TechnicalSupportPageModule' 
	},
    { 
		path: 'dashboard', 
		loadChildren: './pages/dashboard/dashboard.module#DashboardPageModule' 
	},
    { 
		path: 'welcome', 
		loadChildren: './pages/welcome/welcome.module#WelcomePageModule' 
	},

	// Backend routes
	{
		path: 'announcements',
		loadChildren: './pages/announcements/announcements.module#AnnouncementsPageModule'
	},
	{
		path: 'house-list',
		loadChildren: './pages/house-list/house-list.module#HouseListPageModule'
	},
	{
		path: 'house-dashboard/:houseId',
		loadChildren: './pages/house-dashboard/house-dashboard.module#HouseDashboardPageModule'
	},
    {
		path: 'house-roster/:houseId',
		loadChildren: './pages/house-roster/house-roster.module#HouseRosterPageModule'
	},
	{
		path: 'house-roster/:houseId/:date/:mealType',
		loadChildren: './pages/house-roster/house-roster.module#HouseRosterPageModule'
	},
	{
		path: 'house-menus',
		loadChildren: './pages/house-menus/house-menus.module#HouseMenusPageModule'
	},
	{
		path: 'house-menu-builder/list/:houseId',
		loadChildren: './pages/house-menu-builder/menu-list.module#MenuListModule'
	},
	{
		path: 'house-menu-builder/summary/:houseId/:date',
		loadChildren: './pages/house-menu-builder/menu-summary.module#MenuSummaryModule'
	},
	{
		path: 'house-menu-builder/edit/:houseId/:date',
		loadChildren: './pages/house-menu-builder/menu-edit.module#MenuEditModule'
	},
	{ path: '**', redirectTo:'login' }
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
