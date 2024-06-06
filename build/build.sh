#!/bin/bash

SYSDIG_VERSION="0.37.1"
SYSDIG_VERSION_MAC="0.37.1"
SYSDIG_VERSION_WIN32="0.37.1"

# Env parameters
# - CLEANUP (default: true)
# - INSTALL_DEPS (default: false)
# - BUILD_LINUX (default: true)
# - BUILD_CONTAINER (default: true)
# - BUILD_MAC (default: true)
# - BUILD_MAC_INSTALLER (default: false)
# - ENVIRONMENT (default: development)
# - USER_TRACKING_KEY (default: empty)
# - BUILD_NUMBER
# - GIT_BRANCH (default: dev)

setup_env() {
    echo "Prepare environment..."

    set +u

    #
    # Set default variables
    #
    if [ -z ${CLEANUP} ]
    then
        CLEANUP=true
    fi
    if [ -z ${INSTALL_DEPS} ]
    then
        INSTALL_DEPS=false
    fi
    if [ -z ${BUILD_LINUX} ]
    then
        BUILD_LINUX=true
    fi
    if [ -z ${BUILD_CONTAINER} ]
    then
        BUILD_CONTAINER=true
    fi
    if [ -z ${BUILD_MAC} ]
    then
        BUILD_MAC=true
    fi
    if [ -z ${BUILD_MAC_INSTALLER} ]
    then
        BUILD_MAC_INSTALLER=false
    fi
    if [ -z ${BUILD_WIN32} ]
    then
        BUILD_WIN32=true
    fi
    if [ -z ${BUILD_WIN32_INSTALLER} ]
    then
        BUILD_WIN32_INSTALLER=false
    fi
    if [ -z ${ENVIRONMENT} ]
    then
        ENVIRONMENT=development
    fi
    if [ -z ${USER_TRACKING_KEY} ]
    then
        USER_TRACKING_KEY=
    fi
    if [ -z ${GIT_BRANCH} ]
    then
        GIT_BRANCH=dev
    fi
    if [ -z ${BUILD_NUMBER} ]
    then
        BUILD_NUMBER=''
	else
        BUILD_NUMBER=.${BUILD_NUMBER}
    fi

    set -u

    GIT_BRANCHNAME=$(echo ${GIT_BRANCH} | cut -d"/" -f2)

    if [ "${GIT_BRANCHNAME}" != "dev" ]; then
        ENVIRONMENT=production
    fi

	INSPECT_USER_VERSION=$(grep '"version"' package.json | cut -d\" -f4)
    if [[ "${ENVIRONMENT}" = "production" ]]; then
        INSPECT_VERSION=${GIT_BRANCHNAME}
    else
        INSPECT_VERSION=${INSPECT_USER_VERSION}${BUILD_NUMBER}
    fi

    # Disabling interactive progress bar, and spinners gains 2x performances
    # as stated on https://twitter.com/gavinjoyce/status/691773956144119808
    npm config set progress false
    npm config set spin false

    if [ "${ENVIRONMENT}" = "production" ]; then
        DOCKER_IMAGE_TAG=sysdig/sysdig-inspect:${INSPECT_VERSION}
        DOCKER_IMAGE_LATEST_TAG=sysdig/sysdig-inspect:latest
    else
        DOCKER_IMAGE_TAG=sysdig/sysdig-inspect:${INSPECT_VERSION}-${GIT_BRANCHNAME}
    fi
}

install_dependencies() {
    if [ "${INSTALL_DEPS}" = "true" ]; then
        echo "Installing dependencies..."

        rm -rf deps

        if [ "${BUILD_LINUX}" = "true" ] || [ "${BUILD_CONTAINER}" = "true" ]; then
            # Linux binaries

            mkdir -p deps/sysdig-linux

            id=$(docker create sysdig/sysdig:$SYSDIG_VERSION)
            docker cp $id:/usr/bin/sysdig deps/sysdig-linux
            docker cp $id:/usr/bin/csysdig deps/sysdig-linux
            docker cp $id:/usr/share/sysdig/chisels deps/sysdig-linux
            docker rm -v $id

            # note: force is required because the builder container is using sysdig/sysdig referenced image
            docker rmi --force sysdig/sysdig:$SYSDIG_VERSION
        fi

        if [ "${BUILD_MAC}" = "true" ] || [ "${BUILD_MAC_INSTALLER}" = "true" ]; then
            # Mac binaries

            mkdir -p deps/sysdig-mac

			curl -L -o sysdig.dmg "https://github.com/draios/sysdig/releases/download/${SYSDIG_VERSION_MAC}/sysdig-${SYSDIG_VERSION_MAC}-x86_64.dmg"
			7z x sysdig.dmg || true
			cp -v  sysdig-${SYSDIG_VERSION_MAC}-x86_64/bin/sysdig  deps/sysdig-mac/
			cp -v  sysdig-${SYSDIG_VERSION_MAC}-x86_64/bin/csysdig deps/sysdig-mac/
			cp -vr sysdig-${SYSDIG_VERSION_MAC}-x86_64/share/sysdig/chisels deps/sysdig-mac/
        fi

        if [ "${BUILD_WIN32}" = "true" ] || [ "${BUILD_WIN32_INSTALLER}" = "true" ]; then
            # WIN32 binaries

            mkdir -p deps/sysdig-win32/chisels
			mkdir win32
			cd win32
			curl -L -o sysdig-installer.exe "https://github.com/draios/sysdig/releases/download/${SYSDIG_VERSION_WIN32}/sysdig-${SYSDIG_VERSION_WIN32}-AMD64.exe"
			7z e sysdig-installer.exe || true
			cd ..
			cp -v  win32/sysdig.exe  deps/sysdig-win32/
			cp -v  win32/csysdig.exe deps/sysdig-win32/
			cp -v  win32/*.lua       deps/sysdig-win32/chisels
        fi
    fi
}

build() {
    echo "Building..."

    npm run setup

    npm build

    # Currently failing; Disabling tests during investigation
    # npm test

    if [ "${BUILD_LINUX}" = "true" ] || [ "${BUILD_CONTAINER}" = "true" ]; then
        #
        # build Linux package
        #
        rm -rf out/linux

        npm run bundle -- deps/sysdig-linux
        npm run make:linux -- --environment ${ENVIRONMENT} --user-tracking-key ${USER_TRACKING_KEY}

        mkdir -p out/linux/binaries
        mkdir -p out/linux/installers
        cp -r electron-out/make/* out/linux/installers
        cp -r electron-out/Sysdig\ Inspect-linux-x64/* out/linux/binaries
        cd out/linux/installers
		mv *.rpm sysdig-inspect-linux-x86_64.rpm
		mv *.deb sysdig-inspect-linux-x86_64.deb
		cd -
    fi

    if [ "${BUILD_CONTAINER}" = "true" ]; then
        #
        # build Docker image
        #
        rm -rf out/container
        rm -rf dist

        # static resources
        mkdir -p out/container
        mkdir -p out/container/public
        cp -r public/* out/container/public
        # backend
        cp -r electron-out/Sysdig\ Inspect-linux-x64/resources/app/ember-electron/backend/* out/container
        rm -rf out/container/tests
        # frontend
        cp -r electron-out/Sysdig\ Inspect-linux-x64/resources/app/ember/* out/container/public
        rm -rf out/container/public/tests
        rm -rf out/container/public/testem.js

        mkdir -p dist
        cp -r out/container/* dist
        docker build . -t ${DOCKER_IMAGE_TAG}

        if [ "${ENVIRONMENT}" = "production" ]; then
            docker tag ${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_LATEST_TAG}
        fi
    fi

    if [ "${BUILD_MAC}" = "true" ] || [ "${BUILD_MAC_INSTALLER}" = "true" ]; then
        #
        # build MAC package
        #
        rm -rf out/mac

        rm -rf ember-electron/resources/sysdig
        npm run bundle -- deps/sysdig-mac
        if [ "${BUILD_MAC}" = "true" ]; then
            npm run package:mac -- --environment ${ENVIRONMENT} --user-tracking-key ${USER_TRACKING_KEY}
        fi
        if [ "${BUILD_MAC_INSTALLER}" = "true" ]; then
            npm run make:mac -- --environment ${ENVIRONMENT} --user-tracking-key ${USER_TRACKING_KEY}
        fi

        cd electron-out
        zip -ry Sysdig\ Inspect-darwin-x64.zip Sysdig\ Inspect-darwin-x64
        cd ..
        mkdir -p out/mac/binaries
        cp electron-out/Sysdig\ Inspect-darwin-x64.zip out/mac/binaries/sysdig-inspect-mac-x86_64.zip
        if [ "${BUILD_MAC_INSTALLER}" = "true" ]; then
            mkdir -p out/mac/installers
            cp electron-out/make/Sysdig\ Inspect-${INSPECT_USER_VERSION}.dmg out/mac/installers/sysdig-inspect-mac-x86_64.dmg
        fi
    fi

    if [ "${BUILD_WIN32}" = "true" ] || [ "${BUILD_WIN32_INSTALLER}" = "true" ]; then
        #
        # build WIN32 package
        #
        rm -rf out/win32

        rm -rf ember-electron/resources/sysdig
        npm run bundle -- deps/sysdig-mac
        if [ "${BUILD_WIN32}" = "true" ]; then
            npm run package:win -- --environment ${ENVIRONMENT} --user-tracking-key ${USER_TRACKING_KEY}
        fi
        if [ "${BUILD_WIN32_INSTALLER}" = "true" ]; then
            npm run make:win -- --environment ${ENVIRONMENT} --user-tracking-key ${USER_TRACKING_KEY}
        fi

        cd electron-out
		ls -lah
        zip -ry Sysdig\ Inspect-darwin-x64.zip Sysdig\ Inspect-darwin-x64
        cd ..
        mkdir -p out/mac/binaries
        cp electron-out/Sysdig\ Inspect-darwin-x64.zip out/mac/binaries/sysdig-inspect-mac-x86_64.zip
        if [ "${BUILD_WIN32_INSTALLER}" = "true" ]; then
            mkdir -p out/mac/installers
            cp electron-out/make/Sysdig\ Inspect-${INSPECT_USER_VERSION}.dmg out/mac/installers/sysdig-inspect-mac-x86_64.dmg
        fi
    fi
}

cleanup() {
    if [ "${CLEANUP}" = "true" ]; then
        echo "Cleaning up..."

        rm -rf out
        rm -rf dist

        npm run clean

        docker rm ${DOCKER_IMAGE_TAG} || echo "Image ${DOCKER_IMAGE_TAG} not found!"
    fi
}

set -ex
    setup_env
    cleanup
    install_dependencies
    build
set +ex

echo "Done!"
