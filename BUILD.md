# Sysdig Inspect

## Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/): `npm install -g ember-cli`
* Sysdig!
    1. clone https://github.com/draios/sysdig (`csysdig_json` branch)
    2. build the tool following instructions at https://github.com/draios/sysdig/wiki/How-to-Install-Sysdig-from-the-Source-Code#linux-and-osx


## MAC/Linux

### Prepare the environment

1. `git clone https://github.com/draios/sysdig-inspect.git`
2. `cd sysdig-inspect`
3. `npm run setup`


### Run the development version, in the browser

You'll need two separate terminals, one for the server and one for the frontend:

1. Server
    * `npm run start:backend -- [path to sysdig binaries]`

2. Web application
    * `npm run start:webapp`
    * Visit your app at http://localhost:4200


### Run the Electron application

* `npm run start:electron`


### Create the installer

1. `npm run bundle -- [path to sysdig binaries]`
2. MAC: `npm run make:mac`
2. Linux: `npm run make:linux`


### Clean it up

The environment setup and app builds will create several artifacts. Here is how to clean it up to
start fresh:

* `npm run clean`



## Windows

### Prepare the environment

1. `git clone https://github.com/draios/sysdig-inspect.git`
2. `cd sysdig-inspect`
3. `npm run setup:win`


### Run the development version, in the browser

You'll need two separate terminals, one for the server and one for the frontend:

1. Server
    * `npm run start:win:backend -- [path to sysdig binaries]`

2. Web application
    * `npm run start:webapp`
    * Visit your app at http://localhost:4200


### Run the Electron application

* `npm run start:electron`


### Create the installer

1. `npm run bundle:win -- [path to sysdig binaries]`
2. `npm run make:win`


### Clean it up

The environment setup and app builds will create several artifacts. Here is how to clean it up to
start fresh:

* `npm run clean:win`


## Container

You can also create a Docker image to run Sysdig Inspect. This will make Sysdig Inspect available as web application, already bundled with sysdig.

First, make sure to follow the _Prepare the environment_ sections above. Then, here's how you can build the image:

```
npm run make:docker-image

# build the image with Docker
docker build .

# since we haven't tagged the image, let's assume Docker built the image `abc123...`
```

You can now start the container. Note that:

1. it's recommended to mount the directory where you have the Sysdig capture files (`/Users/davide` in the example) to the directory you will use in Sysdig Inspect (`/captures` in the example)
2. You can pick the TCP port you'll use in the browser to launch Sysdig Inspect (`5000` in the example). The container will expose port 3000/tcp.

```
docker run -d -v /Users/davide/:/captures -p5000:3000 abc123
```

And that's it! Now you can open http://localhost:5000 and open a capture file like `/captures/test.scap`.
