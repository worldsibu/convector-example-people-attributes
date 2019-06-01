import { Component, OnInit } from '@angular/core';
import { PersonService } from './person.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  list = [];

  constructor(private service: PersonService) {

  }

  async ngOnInit() {
    this.list = [{
      id: '1',
      name: 'Walter',
      attributes: [],
    }, {
      id: '2',
      name: 'John',
      attributes: [{
        id: 'birth-year',
        certifierID: 'gov',
        content: '1993',
        issuedDate: 1
      }]
    }];

    await this.service.getAll().then(res => {
      this.list = res;
    }).catch(
      err => {
        console.log(err);
      });
  }
}
