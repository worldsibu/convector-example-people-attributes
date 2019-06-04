import { Router, Request, Response } from 'express';
import { PersonControllerBackEnd, refreshAdapter, ParticipantControllerBackEnd } from '../convector';
import { Person, Attribute } from 'person-cc';
import { identityId, couchDBView, couchDBHost, couchDBProtocol, couchDBPort, couchDBPassword, couchDBUser } from '../env';
import { BaseStorage } from '@worldsibu/convector-core';
import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';
import { Participant } from 'participant-cc';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        res.send(await getAllPerson());
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).send(err);
    }
});

BaseStorage.current = new CouchDBStorage({
    host: couchDBHost,
    protocol: couchDBProtocol,
    port: couchDBPort,
    ...(couchDBUser ? {
        auth: {
            user: couchDBUser,
            pass: couchDBPassword
        }
    } : {})
}, couchDBView);

export async function getAllPerson() {
    const viewUrl = '_design/person/_view/all';
    const queryOptions = { startKey: [''], endKey: [''] };

    try {
        const result = <Person[]>(await Person.query(Person, couchDBView, viewUrl, queryOptions));
        return await Promise.all(result.map(item => item.toJSON()));
    } catch (err) {
        console.log(err);
        if (err.code === 'EDOCMISSING') {
            return [];
        } else {
            throw err;
        }
    }
}

router.post('/', async (req: Request, res: Response) => {
    try {
        const { identity } = req.query;
        const { id, name } = req.body;
        let identityObj = new Participant(await ParticipantControllerBackEnd.get(identity));
        const refreshedControllers = await refreshAdapter(identityObj.CAUserName, identityObj.msp);

        const personToCreate = new Person({ id, name });
        // Impersonated controller
        await refreshedControllers.PersonControllerBackEnd.create(personToCreate)
        res.status(201).send();
    } catch (err) {
        console.log('err');
        console.log(err);
        console.log(JSON.stringify(err));
        res.status(500).send(err);
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const personToReturn = new Person(await PersonControllerBackEnd.get(id));
        res.send(personToReturn.toJSON());
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).send(err);
    }
});

router.post('/:id/add-attribute', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { identity } = req.query;
        let identityObj = new Participant(await ParticipantControllerBackEnd.get(identity));
        const refreshedControllers = await refreshAdapter(identityObj.CAUserName, identityObj.msp);

        const { attributeId, content } = req.body;

        const attributeToAdd = new Attribute(attributeId);
        attributeToAdd.content = content;
        attributeToAdd.issuedDate = Date.now();

        // Get the identity the server is using right now
        attributeToAdd.certifierID = identity;

        // Impersonated controller
        await refreshedControllers.PersonControllerBackEnd.addAttribute(id, attributeToAdd);

        const personToReturn = new Person(await PersonControllerBackEnd.get(id));
        res.send(personToReturn.toJSON());
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).send(err);
    }
});

export const PersonExpressController: Router = router;
