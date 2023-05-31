FROM jayfong/yapi:latest

COPY vendors /yapi/vendors

ENV YAPI_ADMIN_ACCOUNT=admin@admin.com
ENV YAPI_ADMIN_PASSWORD=admin
ENV YAPI_CLOSE_REGISTER=true
ENV YAPI_DB_SERVERNAME=127.0.0.1
ENV YAPI_DB_PORT=27017
ENV YAPI_DB_DATABASE=yapi
ENV YAPI_MAIL_ENABLE=false
ENV YAPI_LDAP_LOGIN_ENABLE=false
ENV YAPI_PLUGINS=[]

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories && \
  echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories && \
  apk add --update --no-cache mongodb && \
  mkdir -p /data/db

EXPOSE $PORT

CMD mongod --fork --dbpath=/data/db/  --logpath=mongodb.log && node /yapi/vendors/start.js

