// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { Person, PersonController } from '../src';

describe('Person', () => {
  chai.use(chaiAsPromised);

  let adapter: MockControllerAdapter;
  let personCtrl: ConvectorControllerClient<PersonController>;
  let id = '1-1002-1002'
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    personCtrl = ClientFactory(PersonController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'PersonController',
        name: join(__dirname, '..')
      },
      {
        version: '*',
        controller: 'ParticipantController',
        name: join(__dirname, '../../participant-cc')
      }
    ]);
  });
  
  it('should try to create a person but no government identity has been registered', async () => {
    const personSample = new Person({
      id: id,
      name: 'Test'
    });

    
    await expect(personCtrl.create(personSample)).to.be.eventually
    .rejectedWith('Ups, the requesting identity is not authorized to update the model');;
  
    const justSavedModel = await adapter.getById<Person>(personSample.id);
  
    expect(justSavedModel.id).to.exist;
  });

  it('should try to create a person but no government identity has been registered', async () => {
    const personSample = new Person({
      id: id,
      name: 'Test'
    });

    await personCtrl.create(personSample);
  
    const justSavedModel = await adapter.getById<Person>(personSample.id);
  
    expect(justSavedModel.id).to.exist;
  });
});