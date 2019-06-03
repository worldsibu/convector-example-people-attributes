import { Component, OnInit } from '@angular/core';
import { PersonService } from './person.service';
import { ParticipantService } from './participant.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  identities = [];
  selectedIdentity = '';
  list = [];
  newPerson = { id: '', name: '' };
  status = 'Loading people and participants';

  constructor(private service: PersonService,
    private participantService: ParticipantService) {

  }

  async ngOnInit() {
    await this.reloadPeople();
    await this.reloadParticipants();
    this.cleanStatus();
  }
  setStatus(str, timeout?) {
    this.status = str;
    if (timeout) {
      setTimeout(() => {
        this.status = '';
      }, timeout);
    }
  }
  cleanStatus() {
    this.status = '';
  }
  cleanForm() {
    this.newPerson = { id: '', name: '' };
  }
  async createPerson(person) {
    console.log(person);
    if (!person.id || !person.name) {
      return;
    }
    this.setStatus('Requesting to create person...');
    await this.service.create(person, this.selectedIdentity).then(async res => {
      await this.reloadPeople();
      this.setStatus('Transaction accepted', 3000);
      this.cleanForm();
    }).catch(err => {
      console.log(err);
      this.setStatus('Identity could not create person', 5000);
    });
  }
  async createAttribute(person) {
    console.log(person);
    if (!person.newAttribute.id || !person.newAttribute.content) {
      return;
    }
    this.setStatus('Requesting to add attribute to person...');
    await this.service.addAttribute(person.id, person.newAttribute, this.selectedIdentity)
      .then(async res => {
        await this.reloadPeople();
        this.setStatus('Transaction accepted', 3000);
        this.cleanForm();
      }).catch(err => {
        console.log(err);
        this.setStatus('Identity could not add attribute to person', 5000);
      });
  }
  async reloadPeople() {
    return await this.service.getAll().then(res => {
      res = res.map(item => {
        item.newAttribute = { id: '', content: '' };
        return item;
      });
      this.list = res;
    }).catch(
      err => {
        console.log(err);
      });
  }
  async reloadParticipants() {
    return await this.participantService.getAll().then(res => {
      this.identities = res;
      if (res && res.length > 0) {
        this.selectedIdentity = res[0].id;
      }
    }).catch(err => {
      console.log(err);
    });
  }
}
