[![Waffle.io - Columns and their card count](https://badge.waffle.io/RaiderSoap/cmpm120-project.png?columns=all)](https://waffle.io/RaiderSoap/cmpm120-project?utm_source=badge)
# CMPM 120 Project - Development

UCSC CMPM 120 Phaser Multiplayer Game

## Team

* **Ivan Xu** (yxu83) - [RaiderSoap](https://github.com/RaiderSoap)
* **Julio Choy** - [svntax](https://github.com/svntax)
* **David Kirkpatrick**

### Links

* **[Production Plan](https://docs.google.com/spreadsheets/d/1j9RkvIJDULHMqaTGhHoymikjDXNxcCUxKwtvIhiS2I4/edit?usp=drive_web&ouid=101774301194820727572)**
* **[Team Drive](https://drive.google.com/drive/u/1/folders/0AAoaaZ8jLRMSUk9PVA)**

### Server

Ubuntu NodeJS 10.0 on 16.04

1 GB Memory / 25 GB Disk / SFO2

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

A step by step series of examples that tell you how to get a development env running

```
git clone https://github.com/RaiderSoap/cmpm120-project.git myProject
cd myProject
```

And install dependencies

```
npm install
```

## Start the server

To start testing locally, simply use node

```
node app.js
```

And you you can go to http://localhost:8080

## Code Style

We will use ESLint.

Run to test code consistency:

```
npm run test
```

## Deployment

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

