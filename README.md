# Redemptions Install Script

This script installs the [redemptions app](https://github.com/1Hive/redemptions-app) into an Aragon DAO on Rinkeby.

## Overview

We have a video walkthrough of the script here:

[![Watch the video](https://i.imgur.com/3I4KqFv.png)](https://www.youtube.com/watch?v=3zzsQaKcl3k)

## Running the script

Install the aragonCLI, you can find an installation [guide here](https://forum.aragon.org/t/aragon-cli-setup-guide/1934)

**Download the repo**

`git clone https://github.com/AraStuff/redemptions-install-script.git`

**Navigate to the root directory and install dependencies**

`npm i`

**configure your DAOs addresses in**

`./src/rinkeby.js`

**run the script**

`node ./src/rinkeby.js`

## finding appId and app base
the appId and appBase are different for rinkeby and mainnet. to find them use the following commands

- redemptionsAppId: `aragon apm info redemptions.aragonpm.eth --env aragon:rinkeby | grep appId`
- redemptionsBase: `aragon apm info redemptions.aragonpm.eth --env aragon:rinkeby | grep contractAddres`


## Help

If you have questions or need help please drop into the [Aragon Discord support channel](https://discord.gg/NT5fNRp)!
