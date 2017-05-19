# Project Description

This is a tool I created using Blizzard's [World of Warcraft API](https://dev.battle.net/io-docs), and jQuery to load a character's information, and then scan the Auction House of that character's realm to determine the average cost of item enchantments applicable to that character.

## Prerequisites


## Local Installation

git clone repository
cd into repository

## Server Setup

sudo mkdir -p /var/repos/wow_api.git
cd /var/repos/wow_api.git
sudo git init --bare

sudo nano /var/repos/wow_api.git/hooks/post-receive

sudo chmod +x /var/repos/wow_api.git/hooks/post-receive

sudo mkdir -p /var/www/wow-api.com

## Deployment

git remote add live ssh://root@104.236.20.218:/var/repos/wow_api.git

git push live BRANCH_NAME
