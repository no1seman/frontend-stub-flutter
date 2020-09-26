# Tarantool Front-end stub for Flutter Web App

Since Google Flutter is already in Beta it will be nice to amplify Tarantool Cartridge with the ease and power of Google Flutter for Web.

This simple stub project allows to embed Flutter Web application into Tarantool Cartridge Web UI.

Its look like:
<p align="center"><img width="640" alt="tarantool-flutter" src="https://github.com/no1seman/frontend-stub-flutter/blob/master/resources/tarantool-flutter.jpg"></p>

This repo has a preconfigured webpack config and setup for generate rock and lua bundle in it. Also it has a simple Flutter Web Application.

Based on:

- [Tarantool 2.6.0](https://www.tarantool.io/en/download/?v=2.4)
- [Tarantool Cartridge 2.3.0](https://github.com/tarantool/cartridge)
- [Tarantool Front-end Core 7.3.0](https://github.com/tarantool/frontend-core)
- [Flutter SDK 1.22.0-12.1pre (beta, dev or master channels)](http://flutter.io)

Known issues:

- Flutter Web Application iframe reloads when navigating by main menu, so your Flutter Web Application must persist the state. For example you may use: [hydrated](https://pub.dev/packages/hydrated) or/and [hydrated_bloc](https://pub.dev/packages/hydrated_bloc) packages to persist Webb App state.
- No integration tests
- Building is not tested on non-GNU environments (may be some problems with sed)

## Usage

### 0. Prerequisities

- [Tarantool 2.x.x](https://www.tarantool.io/en/download/?v=2.4)
- [Tarantool Cartridge 2.x.0](https://github.com/tarantool/cartridge)
- [Flutter SDK >1.20.0 (beta, dev or master channels)](http://flutter.io)
- [Nodejs 12.x or better](https://nodejs.org/)
- gzip, make

### 1. Clone repo and install nodejs dependencies (use npm ci NOT npm i)

```bash
git clone git@github.com:tarantool/frontend-stub.git name-as-you-wish
cd name-as-you-wish
npm ci
```

### 2. Configure you project

Run the following command to setup your project's: "name", "Git repository path", and "path to Fluter Web App Project" (Note: Flutter App project must be in "name-as-you-wish" folder):

```bash
npm run config
```

### 3. Generate bundle

```bash
npm run build-rock
```

For developing purposes use the following command:

```bash
npm run start
```

Don't forget change package.json name of your project.

### 4. Install rock and configure Tarantool Cartridge App

```bash
cd <Tarantool Cartridge application dir>
tarantoolctl rocks install <path to rock file>/graphqlide-scm-1.all.rock
```

To get it work just add to Tarantool Cartridge application init.lua the following code:

```lua
require('flutter').init()
```

After it - reload your Tarantool Cartridge:

```bash
cartridge stop && cartridge start -d
```
