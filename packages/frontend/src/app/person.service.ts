import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PersonService {

  constructor(private http: HttpClient) { }

  getAll(): Promise<any> {
    return this.http
      .get(`${environment.serverAddress}/person`).toPromise();
  }
  create(person, identity: string): Promise<any> {
    return this.http
      .post(`${environment.serverAddress}/person?identity=${identity}`, person).toPromise();
  }
  addAttribute(personId, attribute, identity: string): Promise<any> {
    return this.http
      .post(`${environment.serverAddress}/person/${personId}/add-attribute?identity=${identity}`, {
        attributeId: attribute.id,
        content: attribute.content
      }).toPromise();
  }
}
