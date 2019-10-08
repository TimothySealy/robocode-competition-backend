# Robocode competition backend
A backend for the Robocode online competition webapp.

# Installation

## Prerequisites
1. A VPS with node.js and  mongo

## Steps
1. Clone repo.
2. Install modules: ```npm install```.
3. Run app: ```npm run start```. Note this will run the application in the current shell. Run the application using PM2 for long term availability (see instructions below)

## Environment variables
The following environment variables can be set:
```
PORT (default: 3000),
JWT_SECRET (default: 'robocode-competition-jwt-secret')
DB_URL (default: 'mongodb://localhost:27017/robocodecup')
```

## (Recommended) Run application using PM2
1. Install pm2: ```npm install pm2 -g```
2. Run app (```pm2 start index.js```)

## Create an admin user
In the scripts directory you will find a small CLI script to insert an admin user to the database. Steps:
1. Open a terminal and go to scripts directory
2. Run ./user_add.js
3. Follow the instructions and fill in the username and password.
4. Validate the credentials by going to https://<base_url>/web/#!/admin and filling in the credentials in the login form.
5. (Optional) You can update your password by running user_add.js and filling in the same username and your updated password.

# API documentation
To generate api documentation please use the apidoc package.

## Install
```
npm install -g apidoc
```

## Run
You are only required to run this once (or every time the api changes).
```
apidoc -i "routes" -o apidoc
```

## See
Run the server and go to <url>/apidoc to see the documentation.
