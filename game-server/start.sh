#!/usr/bin/env bash

# add hosts
if [ -f /etc/host_hosts ]
then
    cat /etc/host_hosts >> /etc/hosts
fi

# add host ip
host_ip=""
if [ -f /etc/host_ip ]
then
    host_ip=$(cat /etc/host_ip )
fi
# start app
opts=$(env)

server_type=$1
random_id=`head /dev/urandom | tr -dc A-Za-z0-9 | head -c 6`
server_id=${server_type}-${random_id}

echo "Server id=${server_id}"
node app.js host=${host_ip} id=${server_id} ${opts}
