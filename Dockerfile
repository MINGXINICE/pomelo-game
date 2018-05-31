FROM docker.kuaiya.cn/common/pomelo:2.2.5

MAINTAINER diaoruiqing <diaoruiqing@163.com>
ENV LANG="en_US.UTF-8"

ADD game-server /app

WORKDIR /app

RUN  npm install


