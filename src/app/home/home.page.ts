import { Router } from '@angular/router';
import { Movement } from './../../domain-model/Movement';
import { StorageService } from './../services/storage.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @Input() movements: Movement[];

  constructor(
    private router: Router,
    private storageService: StorageService) { }

  async ngOnInit() {
    console.log("Eccomi");
    const user = await this.storageService.get('user');

    if (!user) {
      this.router.navigate(['./user-info-form']);

    }

    this.movements = await this.storageService.getMovements();

  }
}
