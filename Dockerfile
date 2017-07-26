FROM resin/raspberry-pi3-node:7.8.0-20170426

COPY . /opt/agile-idm-web-ui
WORKDIR /opt/agile-idm-web-ui/
#gets rid of the node_modules installed by travis.
RUN rm -rf node_modules
RUN npm install
EXPOSE 3000
ENV DEBUG_IDM_WEB 1
ENV DEBUG_IDM_CORE 1
CMD ./Start.sh
