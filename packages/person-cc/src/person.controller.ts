import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';
import { Participant } from 'participant-cc';

import { Person, Attribute } from './person.model';

@Controller('person')
export class PersonController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async create(
    @Param(Person)
    person: Person
  ) {
    let exists = await Person.getOne(person.id);
    if (!!exists && exists.id) {
      throw new Error('There is a person registered with that Id already');
    }
    let gov = await Participant.getOne('gov');

    if (!gov || !gov.identities) {
      throw new Error('No government identity has been registered yet');
    }
    const govActiveIdentity = gov.identities.find(identity => identity.status === true);

    if (!govActiveIdentity) {
      throw new Error('No active identity found for participant');
    }
    if (this.sender !== govActiveIdentity.fingerprint) {
      throw new Error(`Just the government - ID=gov - can create people - requesting organization was ${this.sender}`);
    }

    await person.save();
  }
  @Invokable()
  public async addAttribute(
    @Param(yup.string())
    personId: string,
    @Param(Attribute.schema())
    attribute: Attribute
  ) {
    // Check if the "stated" participant as certifier of the attribute is actually the one making the request
    let participant = await Participant.getOne(attribute.certifierID);

    if (!participant || !participant.identities) {
      throw new Error(`No participant found with id ${attribute.certifierID}`);
    }

    const participantActiveIdentity = participant.identities.find(
      identity => identity.status === true);

    if (!participantActiveIdentity) {
      throw new Error('No active identity found for participant');
    }

    if (this.sender !== participantActiveIdentity.fingerprint) {
      throw new Error(`Requester identity cannot sign with the current certificate ${this.sender}. This means that the user requesting the tx and the user set in the param certifierId do not match`);
    }

    let person = await Person.getOne(personId);

    if (!person || !person.id) {
      throw new Error(`No person found with id ${personId}`);
    }

    if (!person.attributes) {
      person.attributes = [];
    }

    let exists = person.attributes.find(attr => attr.id === attribute.id);

    if (!!exists) {
      let attributeOwner = await Participant.getOne(exists.certifierID);
      let attributeOwnerActiveIdentity = attributeOwner.identities.find(
        identity => identity.status === true);

      // Already has one, let's see if the requester has permissions to update it
      if (this.sender !== attributeOwnerActiveIdentity.fingerprint) {
        throw new Error(`User already has an attribute for ${attribute.id} but current identity cannot update it`);
      }
      // update as is the right attribute certifier
      exists = attribute;
    } else {
      person.attributes.push(attribute);
    }

    await person.save();
  }

  @Invokable()
  public async get(
    @Param(yup.string())
    id: string
  ) {
    const existing = await Person.getOne(id);
    if (!existing || !existing.id) {
      throw new Error(`No person exists with that ID ${id}`);
    }
    return existing;
  }

  @Invokable()
  public async getAll(
  ) {
    return (await Person.getAll('io.worldsibu.person')).map(person => person.toJSON());
  }

  @Invokable()
  public async getByAttribute(
    @Param(yup.string())
    id: string,
    @Param(yup.mixed())
    value: any
  ) {

    return await Person.query(Person, {
      'selector': {
        'attributes': {
          '$elemMatch': {
            'id': id,
            'content': value
          }
        }
      }
    });
  }
}