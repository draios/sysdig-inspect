#!/bin/bash

# Env parameters
# - BUILD_LINUX (default: true)
# - BUILD_CONTAINER (default: true)
# - BUILD_MAC (default: true)
# - BUILD_MAC_INSTALLER (default: false)
# - ENVIRONMENT (default: development)
# - GIT_BRANCH (default: dev)

setup_env() {
    echo "Prepare environment..."

    set +u

    #
    # Set default variables
    #
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
    if [ -z ${GIT_BRANCH} ]
    then
        GIT_BRANCH=dev
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

    if [ "${ENVIRONMENT}" = "production" ]; then
        DOCKER_IMAGE_TAG=sysdig/sysdig-inspect:${INSPECT_VERSION}
        DOCKER_IMAGE_LATEST_TAG=sysdig/sysdig-inspect:latest
    else
        DOCKER_IMAGE_TAG=sysdig/sysdig-inspect:${INSPECT_VERSION}-${GIT_BRANCHNAME}
    fi
}

publish_artifacts() {
    echo "Uploading artifacts to S3..."

    if [ "${BUILD_LINUX}" = "true" ]; then
        # Linux DEB package
        aws s3 cp out/linux/installers/sysdig-inspect_${INSPECT_USER_VERSION}_amd64.deb s3://download.draios.com/dev/sysdig-inspect/${GIT_BRANCHNAME}/sysdig-inspect_${INSPECT_VERSION}_amd64.deb --acl public-read
        if [ "${ENVIRONMENT}" = "production" ]; then
            aws s3 cp out/linux/installers/sysdig-inspect_${INSPECT_USER_VERSION}_amd64.deb s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect_${INSPECT_VERSION}_amd64.deb --acl public-read
            aws s3 cp out/linux/installers/sysdig-inspect_${INSPECT_USER_VERSION}_amd64.deb s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect_latest_amd64.deb --acl public-read
        fi

        # Linux RPM package
        aws s3 cp out/linux/installers/sysdig-inspect-${INSPECT_USER_VERSION}.x86_64.rpm s3://download.draios.com/dev/sysdig-inspect/${GIT_BRANCHNAME}/sysdig-inspect-${INSPECT_VERSION}.x86_64.rpm --acl public-read
        if [ "${ENVIRONMENT}" = "production" ]; then
            aws s3 cp out/linux/installers/sysdig-inspect-${INSPECT_USER_VERSION}.x86_64.rpm s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect-${INSPECT_VERSION}.x86_64.rpm --acl public-read
            aws s3 cp out/linux/installers/sysdig-inspect-${INSPECT_USER_VERSION}.x86_64.rpm s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect-latest.x86_64.rpm --acl public-read
        fi
    fi

    if [ "${BUILD_MAC}" = "true" ]; then
        # MAC zip bundle
        aws s3 cp out/mac/binaries/sysdig-inspect-${INSPECT_VERSION}-mac.zip s3://download.draios.com/dev/sysdig-inspect/${GIT_BRANCHNAME}/app/mac/sysdig-inspect-${INSPECT_VERSION}-mac.zip --acl public-read
        if [ "${ENVIRONMENT}" = "production" ]; then
            aws s3 cp out/mac/binaries/sysdig-inspect-${INSPECT_VERSION}-mac.zip s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect-${INSPECT_VERSION}-mac.zip --acl public-read
            aws s3 cp out/mac/binaries/sysdig-inspect-${INSPECT_VERSION}-mac.zip s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect-latest-mac.zip --acl public-read
        fi
    fi

    if [ "${BUILD_MAC_INSTALLER}" = "true" ]; then
        # MAC zip bundle
        aws s3 cp out/mac/binaries/sysdig-inspect-${INSPECT_VERSION}-mac.dmg s3://download.draios.com/dev/sysdig-inspect/${GIT_BRANCHNAME}/app/mac/sysdig-inspect-${INSPECT_VERSION}-mac.dmg --acl public-read
        if [ "${GIT_BRANCH}" = "master" ]; then
            aws s3 cp out/mac/binaries/sysdig-inspect-${INSPECT_VERSION}-mac.dmg s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect-${INSPECT_VERSION}-mac.dmg --acl public-read
            aws s3 cp out/mac/binaries/sysdig-inspect-${INSPECT_VERSION}-mac.dmg s3://download.draios.com/stable/sysdig-inspect/sysdig-inspect-latest-mac.dmg --acl public-read
        fi
    fi

    if [ "${BUILD_CONTAINER}" = "true" ]; then
        if [ "${ENVIRONMENT}" = "production" ] || [ "${GIT_BRANCH}" = "dev" ]; then
            echo "Publishing image to Docker hub..."

            docker push ${DOCKER_IMAGE_TAG}

            if [ "${ENVIRONMENT}" = "production" ]; then
                docker push ${DOCKER_IMAGE_LATEST_TAG}
            fi
        fi
    fi
}

cleanup() {
    echo "Cleaning up..."
    
    docker rm ${DOCKER_IMAGE_TAG} || echo "Image ${DOCKER_IMAGE_TAG} not found!"
}

set -ex
    setup_env
    publish_artifacts
    cleanup
set +ex

echo "Done!"
