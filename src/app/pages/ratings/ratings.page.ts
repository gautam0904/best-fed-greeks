import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BFGUserService } from '../../services/bfg-user.service';

@Component({
  standalone: false,
  selector: 'app-ratings',
  templateUrl: './ratings.page.html',
  styleUrls: ['./ratings.page.scss'],
})
export class RatingsPage implements OnInit {

  constructor( public router: Router, public bfgUser: BFGUserService ) { }

  ngOnInit() {
  }

}
