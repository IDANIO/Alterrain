[![Waffle.io - Columns and their card count](https://badge.waffle.io/RaiderSoap/cmpm120-project.png?columns=all)](https://waffle.io/RaiderSoap/cmpm120-project?utm_source=badge)
[![Build Status](https://travis-ci.org/RaiderSoap/cmpm120-project.svg?branch=master)](https://travis-ci.org/RaiderSoap/cmpm120-project)


# Alterrain MMO

UCSC CMPM 120 Phaser Multiplayer Game

![idanio](https://lh3.googleusercontent.com/aFFYSESE8jP0ZcKnuHvzoMPax--0lzu1CCx-nAlrrT709nIDy3y1twr6CdCdApdzCtI5uwryoI_dEp-ZCfS2MqtRAlQvWExQ966Bm4FrW7EcVf-sl-lCmPnhpEH1KRRq-yIvP3TCqoiHiJOUlZyGHc2ftPnfYh4wjDqhtr_icgjtScE1MViGMvDxm7UZ8tW6EBhiv_N3OeMAZbAoEqxaiOnMsUzZSAOui_BGz5iQX104Nb84552h9cUk-wt_ityrd4_KIAyrbgYE8zd4YA44vGQ6zJYGtG-bMaABTB-2mPQdiFeqUFmRj66_kDe-7ETAYqNxa0hEX7nJ_DBlC6botTSpdpVx55LdMkkJ2MWSmTGrQ3bqFuLA28SVUsup7X4LPU2DCw0ZIFqIwcxbYO05-1SRTssNUpuj-m9soFTUBC8ACWBpBpH4UP6XVq1OujqfF_lfRRX45Bp4rJ2dajWQVwnVKoEolK2XbtiVevoRXt4tFJ8xcbFAuH_0sNQURlvoNpSc3cO2T0O4ej07mmVxmhhdyiykVaaijHoxM1EppJgGR2_v3MkDZbljWfmdy2VRyDKXDRLq_pXN0LjGR3d_p23dJsVFpTdOQ8DR-Q=w1377-h367-no "idanio")


## Team

* **Ivan Xu** (yxu83) - [RaiderSoap](https://github.com/RaiderSoap)
* **Julio Choy** - [svntax](https://github.com/svntax)
* **David Kirkpatrick** - [DavidKirkpatrick95](https://github.com/DavidKirkpatrick95)

### Links

* **[Production Plan](https://docs.google.com/spreadsheets/d/1j9RkvIJDULHMqaTGhHoymikjDXNxcCUxKwtvIhiS2I4/edit?usp=drive_web&ouid=101774301194820727572)**
* **[Team Drive](https://drive.google.com/drive/u/1/folders/0AAoaaZ8jLRMSUk9PVA)**

### Server

Ubuntu NodeJS 10.0 on 16.04

1 GB Memory / 25 GB Disk / SFO2

## Getting Started (For Graders)

First, vist or website at https://idanio.online. In case the server is down, and you would like to play on your local host, please follow the following steps to set up the game.  

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. (To developers) See deployment for notes on how to deploy the project on a live system.

### Installing

A step by step series of examples that tell you how to get a development env running

[Node.js](https://nodejs.org/en/) - JavaScript runtime built on Chrome's V8 JavaScript engine. 

Download node.js at lesat 8.XX.X version. (We are using 10.0.0).

After install node.js on your computer. You can now type in your terminal to check node is working.

```
node --version

// v10.0.0
```

Clone our repository,

```
git clone https://github.com/RaiderSoap/cmpm120-project.git myProject
cd myProject
```

And install dependencies, using node package manager (installed with Node.js).

```
npm install
```

## Start the server (For Graders)

To start testing locally, simply use node

```
node app.js
```

And you can go to http://localhost:8080, good to go.

Enjoy exporing wonder! 
:) 

## Code Style (For Developers)

We will use ESLint.

Run to test code consistency:

```
npm run test
```

## Deployment (For Developers)

Once you have committed and pushed to this repository

Login into our server, as user *game*


First we need to pull from GitHub,

```
cd /home/game/project
git pull
```

Then start the game application (only if the game is not work as expected):

```
pm2 start game      // game is a task I already defined
```

To list all running processes:

```
pm2 list
```

Managing processes is straightforward:

```
pm2 stop      <game|'all'>
pm2 restart   <game|'all'>
```

To monitor logs, custom metrics, process information:

```
pm2 monit
```

## Built With

* [Socket.io](http://socket.io) - Realtime application framework (Node.JS server)
* [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for node.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

