FROM ubuntu:focal

USER root

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y git curl fuse libfuse2 gcc g++ make libxtst-dev libpng++-dev
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g node-gyp

WORKDIR /wl

ADD ./build.sh /build.sh
RUN chmod +x /build.sh

ENTRYPOINT /bin/bash
CMD while true; do sleep 1; done
#CMD /build.sh