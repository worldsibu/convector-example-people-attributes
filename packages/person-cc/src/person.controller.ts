import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';
import { Participant } from 'participant-cc';

import { Person } from './person.model';

@Controller('person')
export class PersonController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async create(
    @Param(Person)
    person: Person
  ) {

    let gov = await Participant.getOne('gov');

    if (!gov || !gov.identities) {
      throw new Error('No government identity has been registered yet');
    }
    const govActiveIdentity = gov.identities.filter(identity => identity.status === true)[0];

    if (this.sender !== govActiveIdentity.fingerprint) {
      throw new Error(`Just the government - ID=gov - can create people - requesting organization was ${this.sender}`);
    }

    await person.save();
  }
}