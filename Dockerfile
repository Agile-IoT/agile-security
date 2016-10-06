FROM  node:6.3.1

RUN apt-get update && apt-get clean
RUN apt-get install -y libpam0g-dev
RUN apt-get install -y git

WORKDIR /opt/agile-idm-web-ui
RUN git clone https://github.com/Agile-IoT/agile-idm-web-ui /opt/agile-idm-web-ui
#npm --save authenticate-pam
RUN npm install
WORKDIR /opt/agile-idm-web-ui/example
RUN npm install
EXPOSE 3000
#use external volume to configure. Place it in /etc/idm folder (what is in the example/conf)
CMD node /opt/agile-idm-web-ui/example/app-docker.js
#CMD /bin/bash
