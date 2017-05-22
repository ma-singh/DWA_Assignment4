# Project Description

This is a tool I created using Blizzard's [World of Warcraft API](https://dev.battle.net/io-docs), and jQuery to load a character's information, and then scan the Auction House of that character's realm to determine the average cost of item enchantments applicable to that character.

## Local Installation

Clone this repository into your local machine's working directory
```
git clone https://github.com/ma-singh/DWA_Assignment4-1.git
```

Change directory into the repository you just cloned
```
cd DWA_Assignment4-1
```

## Workflow and Development

Before you begin developing switch to the development branch.
```
git checkout -b development
```

Create a new branch for your feature
```
git checkout -b <FEATURE_NAME>
```

When finished developing, merge your feature back into the development branch
```
git checkout development
git merge <FEATURE_NAME>
```

![Development Workflow](http://i.imgur.com/f2drHGV.jpg)

## Deployment

Commit changes you've made during your local development to GitHub
```
git push origin development
```

If you are required to push a release live, you can do so with the following on your local machine. First, pull the latest stable version of the repository
```
git pull origin <TAGGED_RELEASE>
```

Switch to the production branch
```
git checkout -b production
```

Add the Production server to your list of remote repositories
```
git remote add <REMOTE_SERVER_NAME> ssh://<username>:<IP_ADDRESS>:/var/repos/wow_api.git
```

Push to the Production server
```
git push <REMOTE_SERVER_NAME> production
```
