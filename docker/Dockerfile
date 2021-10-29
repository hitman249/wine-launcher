FROM ubuntu:focal

USER root

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y git curl libfuse2 gcc g++ make libxtst-dev libpng++-dev
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g node-gyp

ADD ./build.sh /build.sh
RUN chmod +x /build.sh

WORKDIR /wl

CMD /build.sh