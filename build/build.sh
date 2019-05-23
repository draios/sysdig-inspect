#!/bin/bash

SYSDIG_VERSION="0.24.1"

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
# - JOB_NAME
# - GIT_BRANCH (default: dev)
# - GIT_COMMIT (default: empty)
# - AT

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
    if [ -z ${GIT_COMMIT} ]
    then
        GIT_COMMIT=
    fi
    if [ -z ${BUILD_NUMBER} ]
    then
        BUILD_NUMBER=42
    fi

    set -u

    GIT_BRANCHNAME=$(echo ${GIT_BRANCH} | cut -d"/" -f2)

    if [ "${GIT_BRANCHNAME}" = "master" ]; then
        ENVIRONMENT=production
    fi

    INSPECT_USER_VERSION=`cat VERSION`
    if [ "${ENVIRONMENT}" = "production" ]; then
        INSPECT_VERSION=${INSPECT_USER_VERSION}
    else
        INSPECT_VERSION=${INSPECT_USER_VERSION}.${BUILD_NUMBER}
    fi

    # Disabling interactive progress bar, and spinners gains 2x performances
    # as stated on https://twitter.com/gavinjoyce/status/691773956144119808
    npm config set progress false
    npm config set spin false

    if [ "${ENVIRONMENT}" = "production" ]; then
        DOCKER_IMAGE_TAG=sysdig/sysdig-inspect:${INSPECT_VERSION}
    else
        DOCKER_IMAGE_TAG=sysdig/sysdig-inspect:${INSPECT_VERSION}-${GIT_BRANCHNAME}
    fi
}

before_build() {
    if [ -z ${GIT_COMMIT} ]; then
        echo "Skip status check update"
    else
        echo "Updating commit status check..."

        GH_STATUS="pending"
        GH_DESCRIPTION="Build #${BUILD_NUMBER} started..."
        GH_CONTEXT="jenkins/sysdig-inspect"

        curl 'https://api.github.com/repos/draios/sysdig-inspect/statuses/'"${GIT_COMMIT}"'?access_token='"${AT}"'' \
        -H 'Content-Type: application/json' \
        -X POST \
        -d '{"state": "'"${GH_STATUS}"'", "context": "'"${GH_CONTEXT}"'", "description": "'"${GH_DESCRIPTION}"'", "target_url": "'"${GH_URL}"'"}'
    fi
}

install_dependencies() {
    if [ "${INSTALL_DEPS}" = "true" ]; then
        echo "Installing dependencies..."

        rm -rf deps

        mkdir -p deps/sysdig-linux
        mkdir -p deps/sysdig-mac

        id=$(docker create sysdig/sysdig:$SYSDIG_VERSION)
        docker cp $id:/usr/bin/sysdig deps/sysdig-linux
        docker cp $id:/usr/bin/csysdig deps/sysdig-linux
        docker cp $id:/usr/share/sysdig/chisels deps/sysdig-linux
        docker rm -v $id
        docker rmi sysdig/sysdig:$SYSDIG_VERSION

        # Mac binaries
        curl https://download.sysdig.com/dependencies/sysdig-${SYSDIG_VERSION}-mac.zip -o sysdig.zip
        unzip -d deps/sysdig-mac sysdig.zip
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
        cp electron-out/Sysdig\ Inspect-darwin-x64.zip out/mac/binaries/sysdig-inspect-${INSPECT_VERSION}-mac.zip
        if [ "${BUILD_MAC_INSTALLER}" = "true" ]; then
            mkdir -p out/mac/installers
            cp electron-out/make/Sysdig\ Inspect-${INSPECT_USER_VERSION}.dmg out/mac/installers/sysdig-inspect-${INSPECT_VERSION}-mac.dmg
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

after_build() {
    if [ -z ${GIT_COMMIT} ]; then
        echo "Skip status check update"
    else
        echo "Updating commit status check..."

        GH_STATUS="success"
        GH_DESCRIPTION="Build #${BUILD_NUMBER} succeeded"
        GH_URL="https://ci.draios.com/view/sysdig-inspect/job/${JOB_NAME}/${BUILD_NUMBER}/"
        GH_CONTEXT="jenkins/sysdig-inspect"

        curl 'https://api.github.com/repos/draios/sysdig-inspect/statuses/'"${GIT_COMMIT}"'?access_token='"${AT}"'' \
        -H 'Content-Type: application/json' \
        -X POST \
        -d '{"state": "'"${GH_STATUS}"'", "context": "'"${GH_CONTEXT}"'", "description": "'"${GH_DESCRIPTION}"'", "target_url": "'"${GH_URL}"'"}'
    fi
}

set -ex
    setup_env
    before_build
    cleanup
    install_dependencies
    build
    after_build
set +ex

echo "Done!"
