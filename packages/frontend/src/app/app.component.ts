import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  list = [];

  ngOnInit(): void {
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
  }
}
