#FROM  hypriot/rpi-node
FROM resin/raspberrypi3-node:7.2.1
RUN apt-get update
RUN  apt-get clean
#RUN apt-get install -y libpam0g-dev
RUN apt-get install -y git

WORKDIR /opt/agile-idm-web-ui
RUN git clone https://github.com/Agile-IoT/agile-idm-web-ui /opt/agile-idm-web-ui
#npm --save authenticate-pam
RUN npm install
WORKDIR /opt/agile-idm-web-ui/
RUN npm install
EXPOSE 3000
CMD node /opt/agile-idm-web-ui/app.js $DOCKER_CONF
#CMD /bin/bash
