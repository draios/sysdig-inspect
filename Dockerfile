FROM sysdig/sysdig:0.26.1



###############################################################################
#                                                                             #
# Install basic tools/utilities                                               #
#                                                                             #
###############################################################################

#
# Install Node.js v10
# (ref. https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
#
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

#
# Cleanup
#
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*



###############################################################################
#                                                                             #
# Prepare environment                                                         #
#                                                                             #
###############################################################################

ENV NODE_ENV production
ENV SYSDIG_SERVER_PORT 3000
ENV SYSDIG_PATH /usr/bin
ENV SYSDIG_SERVER_HOSTNAME 0.0.0.0

#
# Add binaries
#
ADD dist /usr/bin/sysdig-inspect
WORKDIR /usr/bin/sysdig-inspect

#
# Configure health check
#
HEALTHCHECK --interval=1m --timeout=20s \
  CMD curl -f http://localhost:3000/health || exit 1

#
# Expose Sysdig Inspect UI endpoint
#
EXPOSE 3000



###############################################################################
#                                                                             #
# Start Sysdig Inspect                                                        #
#                                                                             #
###############################################################################

CMD ["npx", "forever", "main.js"]
