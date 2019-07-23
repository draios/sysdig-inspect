FROM debian:stable-slim



###############################################################################
#                                                                             #
# Install basic tools/utilities                                               #
#                                                                             #
###############################################################################

RUN apt-get update -qq && \
    apt-get dist-upgrade -u -y && \
    apt-get install -y \
        net-tools \
        dnsutils \
        procps \
        sudo \
        ca-certificates \
        lsb-release \
        curl \
        git && \
    apt-get install -f && \
    apt-get clean

RUN apt-get install -y \
        rpm \
        zip \
        unzip \
        build-essential \
        python && \
    apt-get install -f && \
    apt-get clean

# Install Node.js v10
# (ref. https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

# Install the latest Docker CE binaries
# From https://github.com/getintodevops/jenkins-withdocker/blob/master/Dockerfile
RUN apt-get update && \
    apt-get -y install apt-transport-https \
      ca-certificates \
      curl \
      gnupg2 \
      software-properties-common && \
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg > /tmp/dkey; apt-key add /tmp/dkey && \
    add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
      $(lsb_release -cs) \
      stable" && \
   apt-get update && \
   apt-get -y install docker-ce

# Cleanup
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*



###############################################################################
#                                                                             #
# Prepare environment                                                         #
#                                                                             #
###############################################################################

WORKDIR /usr/bin/sysdig-inspect

# Electron runs sudo bower, which is not allowed. See https://serverfault.com/a/755902
RUN echo '{ "allow_root": true }' > ~/.bowerrc



###############################################################################
#                                                                             #
# Run the build                                                               #
#                                                                             #
###############################################################################

CMD ["./build/build.sh"]
