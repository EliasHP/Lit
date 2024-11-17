#!/bin/bash
set -e
until mysqladmin ping -h "db" --silent; do
    echo "Waiting for MySQL..."
    sleep 2
done
echo "MySQL is up - starting the backend"
exec "$@"
