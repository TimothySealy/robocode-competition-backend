# Robocode competition backend
A backend for the Robocode online competition webapp.

# Installation

## Prerequisites
1. A VPS with node.js and  mongo

## Steps
1. Clone repo.
2. Install modules: ```npm install```.
3. Run app: ```npm run start```. Note this will run the application in the current shell. Run the application using PM2 for long term availability (see instructions below)

## (Optional) Run application using PM2
1. (Optional) Install pm2: ```npm install pm2 -g```
2. Run app (```pm2 start index.js```)
