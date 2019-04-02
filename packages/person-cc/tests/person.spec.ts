// tslint:disable:no-unused-expression
import { join } from 'path';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';

import * as chai from 'chai';
import { expect } from 'chai';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { ParticipantController, Participant } from 'participant-cc';

import { Person, PersonController, Attribute } from '../src';

describe('Person', () => {
  chai.use(chaiAsPromised);
  // A fake certificate to emulate multiple wallets
  const fakeSecondParticipantCert = '-----BEGIN CERTIFICATE-----' +
    'MIICjzCCAjWgAwIBAgIUITsRsw5SIJ+33SKwM4j1Dl4cDXQwCgYIKoZIzj0EAwIw' +
    'czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh' +
    'biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT' +
    'E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwODEzMDEyOTAwWhcNMTkwODEzMDEz' +
    'NDAwWjBCMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw' +
    'YXJ0bWVudDExDjAMBgNVBAMTBXVzZXIzMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD' +
    'QgAEcrfc0HHq5LG1UbyPSRLNjIQKqYoNY7/zPFC3UTJi3TTaIEqgVL6DF/8JIKuj' +
    'IT/lwkuemafacXj8pdPw3Zyqs6OB1zCB1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T' +
    'AQH/BAIwADAdBgNVHQ4EFgQUHFUlW/XJC7VcJe5pLFkz+xlMNpowKwYDVR0jBCQw' +
    'IoAgQ3hSDt2ktmSXZrQ6AY0EK2UHhXMx8Yq6O7XiA+X6vS4waAYIKgMEBQYHCAEE' +
    'XHsiYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1lbnQxIiwi' +
    'aGYuRW5yb2xsbWVudElEIjoidXNlcjMiLCJoZi5UeXBlIjoiY2xpZW50In19MAoG' +
    'CCqGSM49BAMCA0gAMEUCIQCNsmDjOXF/NvciSZebfk2hfSr/v5CqRD7pIHCq3lIR' +
    'lwIgPC/qGM1yeVinfN0z7M68l8rWn4M4CVR2DtKMpk3G9k9=' +
    '-----END CERTIFICATE-----';
  // By default, MockControllerAdapter will use this fingerprint as the `this.sender`
  const mockIdentity = 'B6:0B:37:7C:DF:D2:7A:08:0B:98:BF:52:A4:2C:DC:4E:CC:70:91:E1';

  let adapter: MockControllerAdapter;
  let personCtrl: ConvectorControllerClient<PersonController>;
  let participantCtrl: ConvectorControllerClient<ParticipantController>;
  let personId = '1-1002-1002'
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
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
    adapter.stub['fingerprint'] = mockIdentity;
    personCtrl = ClientFactory(PersonController, adapter);
    participantCtrl = ClientFactory(ParticipantController, adapter);
  });

  it('should try to create a person but no government identity has been registered', async () => {
    const personSample = new Person({
      id: personId,
      name: 'Walter Montes'
    });

    await expect(personCtrl.create(personSample)).to.be.eventually
      .rejectedWith(Error);
  });

  it('should create the government identity', async () => {
    await participantCtrl.register('gov', 'Big Gov');

    const justSavedModel = await adapter.getById<Participant>('gov');

    expect(justSavedModel.id).to.exist;
  });

  it('should create a person', async () => {
    const personSample = new Person({
      id: personId,
      name: 'Walter Montes'
    });

    await personCtrl.create(personSample);

    const justSavedModel = await adapter.getById<Person>(personSample.id);

    expect(justSavedModel.name).to.exist;
  });

  it('should add a birth-year attribute through the gov identity', async () => {
    let attributeId = 'birth-year';
    let attribute = new Attribute(attributeId);
    attribute.certifierID = 'gov';
    attribute.content = '1993';
    attribute.issuedDate = Date.now();

    await personCtrl.addAttribute(personId, attribute);

    const justSavedModel = await adapter.getById<Person>(personId);
    expect(justSavedModel.id).to.exist;

    const resultingAttr = justSavedModel.attributes.find(attr => attr.id === attributeId);

    expect(resultingAttr).to.exist;
    expect(resultingAttr.id).to.eq(attribute.id);
  });

  it('should create a participant for the MIT', async () => {
    // Fake another certificate for tests
    (adapter.stub as any).usercert = fakeSecondParticipantCert;

    await participantCtrl.register('mit', 'MIT - Massachusetts Institute of Technology');

    const justSavedModel = await adapter.getById<Participant>('mit');

    expect(justSavedModel.id).to.exist;
  });

  it('should try to create a person but the MIT cannot', async () => {
    const personSample = new Person({
      id: personId + '1111',
      name: 'Walter Montes'
    });

    await expect(personCtrl.create(personSample)).to.be.eventually
      .rejectedWith(Error);
  });

  it('should add a mit-degree attribute through the MIT identity', async () => {
    // Fake another certificate for tests
    (adapter.stub as any).usercert = fakeSecondParticipantCert;

    let attributeId = 'mit-degree';
    let attribute = new Attribute(attributeId);
    attribute.certifierID = 'mit';
    attribute.content = {
      level: 'dummy',
      honours: 'high',
      description: 'Important title!'
    };
    attribute.issuedDate = Date.now();

    await personCtrl.addAttribute(personId, attribute);

    const person = await adapter.getById<Person>(personId);
    expect(person.id).to.exist;

    const resultingAttr = person.attributes.find(attr => attr.id === attributeId);
    expect(resultingAttr).to.exist;
    expect(resultingAttr.id).to.eq(attribute.id);
  });

  it('should try to make the birth-year expire! with the MIT identity', async () => {
    // Fake another certificate for tests
    (adapter.stub as any).usercert = fakeSecondParticipantCert;
    const person = await adapter.getById<Person>(personId);
    let attribute = person.attributes.find(attr => attr.id === 'birth-year');

    attribute.certifierID = 'mit';
    attribute.expired = true;
    await expect(personCtrl.addAttribute(personId, attribute)).to.be.eventually.rejectedWith(Error);
  });
});