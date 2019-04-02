# attributesDb - person

> This project is the result of this tutorial: https://docs.worldsibu.com/article/89-tutorial

## Run this project

```bash
# Start your blockchain network and install the smart contract
npm start

# Important: This first call takes some seconds as it provisions the containers needed to run the smart contract
# Create the government Network Participant with the user Admin
hurl invoke person participant_register gov "Big Government" -u admin

# Add the MIT
hurl invoke person participant_register mit "MIT" -u user1

# Create a person
hurl invoke person person_create "{\"id\":\"1-100-100\", \"name\": \"Walter Montes\"}" -u admin

# Assign it a birth-year attribute
hurl invoke person person_addAttribute "1-100-100" "{\"id\": \"birth-year\", \"certifierID\": \"gov\", \"content\": \"1993\", \"issuedDate\": 1554239270 }" -u admin
```

## Tests

```
npm test
```

> Check all the information to work with Convector <a href="https://worldsibu.github.io/convector" target="_blank">in the DOCS site</a>.

## Collaborate to the Convector Suite projects

* <a href="https://discord.gg/twRwpWt" target="_blank">Discord chat with the community</a>
* <a href="https://github.com/worldsibu" target="_blank">Convector projects</a>
