import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '../../services/common/http.service';
import { MessageService } from '../../services/common/message.service';
import { BFGUserService } from '../../services/bfg-user.service';

import moment from 'moment';

@Component({
  standalone: false,
	selector: 'app-house-menu-list',
	templateUrl: './menu-list.page.html',
	styleUrls: ['./menu-list.page.scss'],
})
export class MenuListPage {
	public loaded: boolean = false;
	public menus: any = [];
	public houseName: string = '';

	private _houseId: number = 0;
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
		});
	}

	public async ionViewDidEnter() {
		if(!this.bfgUser.isSuperChef() && !this.bfgUser.isChef()) {
			this.router.navigateByUrl('/login');
			this.msg.showToast('Error', 'Oops. We had trouble loading the dashboard.');
			return;
		}

		if(this._houseId) {
			this.loadMenuList(this._houseId);
		}
	}

	public back() {
		this.router.navigate(['/house-dashboard/', this._houseId]);
	}

	public goToMenu(mondayOfWeek) {
		this.router.navigate(['/house-menu-builder/summary/', this._houseId, mondayOfWeek]);
	}

	protected async loadMenuList(houseId) {
		await this.msg.showLoader();

		this._houseId = houseId;

		this.bfgUser.initializeHouses().subscribe(async myResponse => {
			this.bfgUser.switchToHouse(houseId);

			this.http.post('bfg/menu-builder/load-list', {
				bfg_house_id: houseId
			}).subscribe(async response => {
				await this.msg.hideLoader();

				this.menus = response.menus_summary.weeks;
				this.houseName = response.house_name;

				console.log(response);
				this.loaded = true;
			});
		});
	}
}
