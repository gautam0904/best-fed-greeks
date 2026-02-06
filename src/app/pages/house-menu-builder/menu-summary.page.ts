import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import { saveAs } from 'file-saver';
import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-house-menu-summary',
	templateUrl: './menu-summary.page.html',
	styleUrls: ['./menu-summary.page.scss'],
})
export class MenuSummaryPage {
	public loaded: boolean = false;
	public pastDue: boolean = false;
	public menuStatus: string = 'In Progress';
	public houseName: string = '';
	public status: string = '';
	public deadline: string = '';
	public mealTypeStatuses:any = [];
	public mealDateStatuses:any = [];
	public distinctComments:any = [];
	public canSubmit:boolean = false;
	public notApproved:boolean = false;
	public canPrint:boolean = false;

	private _dateStart: string = '';
	private _dateEnd: string = '';
	private _houseId: number = 0;
	private _date: string = '';
	private _dateRangeDisplay: string = '';

	public get dateRangeDisplay() {
		return this._dateRangeDisplay;
	}

	constructor(
		public bfgUser: BFGUserService,
		private router:Router,
		private route: ActivatedRoute,
		private http: HttpService,
		private msg: MessageService
	) {}

	ngOnInit() {
		this.route.params.subscribe( params => {
			this._houseId = parseInt(params['houseId']);
			this._date = params['date'];
			this._dateStart = moment(this._date).format('MM/DD/YYYY');
			this._dateEnd = moment(this._dateStart).add('6', 'days').format('MM/DD/YYYY');
			this._dateRangeDisplay = this._dateStart + ' - ' + this._dateEnd;
		});
	}

	public back() {
		this.router.navigate(['/house-menu-builder/list/', this._houseId]);
	}


	public async ionViewDidEnter() {
		if(!this.bfgUser.isSuperChef() && !this.bfgUser.isChef()) {
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		if(this._houseId) {
			this.loadMenuSummary(this._houseId);
		}
	}

	public editMenu() {
		this.router.navigate(['/house-menu-builder/edit/', this._houseId, this._date]);
	}

	public async submitMenu() {
		await this.msg.showLoader('Submitting, please wait...');

		this.http.post('bfg/menu-builder/submit-menu', {
			bfg_house_id: this._houseId,
			start: this._date,
			end: moment(this._date).add('6', 'days').format('MM/DD/YYYY')
		}).subscribe(async response => {
			await this.msg.hideLoader();
			await this.loadMenuSummary(this._houseId);
		});
	}

	public async printMenu() {
		await this.msg.showLoader('Printing, please wait...');

		this.http.post('bfg/menu-builder/print-menu', {
			bfg_house_id: this._houseId,
			start: this._date,
			end: moment(this._date).add('6', 'days').format('MM/DD/YYYY')
		}, { responseType:'blob' }).subscribe(async response => {
			await this.msg.hideLoader();
			
			saveAs(response, 'menu-' + this._houseId + '-week-of-' + this._date);
		});
	}


	protected async loadMenuSummary(houseId) {
		await this.msg.showLoader();

		this._houseId = houseId;

		this.bfgUser.initializeHouses().subscribe(async myResponse => {
			this.bfgUser.switchToHouse(houseId);

			this.http.post('bfg/menu-builder/load-menu-summary', {
				bfg_house_id: houseId,
				monday_of_week: this._date
			}).subscribe(async response => {
				await this.msg.hideLoader();

				let weekWithDetails = response.menu_summary.week_with_details;

				this.status = weekWithDetails.menu_status;
				this.deadline = weekWithDetails.deadline;
				this.mealTypeStatuses = weekWithDetails.meal_type_statuses;
				this.mealDateStatuses = weekWithDetails.meal_date_statuses;
				this.houseName = response.menu_summary.house_name;


				this.distinctComments = weekWithDetails.distinct_comments;

				if(this.status == 'Can Submit' || this.status == 'Changes Needed') {
					this.canSubmit = true;
					this.notApproved = true;
					this.canPrint = false;
				}
				else if(this.status != 'Approved') {
					this.notApproved = true;
					this.canSubmit = false;
					this.canPrint = false;
				}
				else if(this.status == 'Approved') {
					this.notApproved = false;
					this.canSubmit = false;
					this.canPrint = true;
				}

				this.loaded = true;
			});
		});
	}
}
