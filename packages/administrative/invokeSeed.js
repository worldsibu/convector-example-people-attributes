// tslint:disable:max-line-length
const wshelper = require('@worldsibu/convector-common-fabric-helper');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const d = require('debug')('forma:helper');

const chaincode = process.env.CHAINCODE || 'person';
const fcn = 'participant_register';
const keyStore = path.resolve(__dirname, process.env.KEYSTORE);
const networkProfile = path.resolve(__dirname, process.env.NETWORKPROFILE);
const channel = process.env.CHANNEL;
d(`KEYSTORE=${keyStore}`);
d(`NETWORKPROFILE=${networkProfile}`);
d(`CHAINCODE=${chaincode}`);
d(`FUNCTION=${fcn}`);
d(`CHANNEL=${channel}`);

d('First transaction may take a while');

Promise.all(
    [{
        username: 'gov',
        name: 'Government'
    }, {
        username: 'mit',
        name: 'MIT'
    }, {
        username: 'naba',
        name: 'National Bank'
    }].map(async user => {

        let helper = new wshelper.ClientHelper({
            channel: channel,
            skipInit: true,
            user: user.username,
            keyStore: keyStore,
            networkProfile: networkProfile,
            txTimeout: 300000
        });

        d('Sending transaction...');
        await helper.init();

        try {
            await helper.useUser(user.username);

            const { proposalResponse } = await helper.sendTransactionProposal({
                fcn: fcn,
                chaincodeId: chaincode,
                args: [user.username, user.name],
            }, true);

            res = await helper.processProposal(proposalResponse);

            d(`Transaction sent! ${res.code} ${res.info} ${res.status} ${res.txId}`);
            d(`Result: ${JSON.stringify(res.result)}`);

        } catch (ex) {
            if (ex.responses) {
                if (ex.responses.filter(response => !response.isProposalResponse).length === 0) {
                    d(`No peer ran tx successfully!`);
                    d(ex.responses);
                    d(ex);
                    return;
                }
                d(`At least one peer returned an error!`);
                d(`This may happen when a transaction queries private data that's not accessible to all peers`);
                ex.responses.map(response => {
                    d(`Response from ${response.peer}`);
                    if (response.isProposalResponse) {
                        d(JSON.stringify(response));
                    } else {
                        // Good response
                        d(response.response.payload.toString('utf8'));
                    }
                });
            } else {
                d(`Errors found!`);
                console.log(ex);
                d(ex);
            }
        }
    }));
