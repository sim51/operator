#!/bin/bash

# Shutdown and remove old container
echo "Delete container"
docker rm -f neo4j_operator_test

# Start the container
echo "Run container"
docker run \
       --detach \
       --name=neo4j_operator_test \
       --publish=17474:7474 \
       --publish=17473:7473 \
       --publish=17687:7687 \
       --env=NEO4J_AUTH=neo4j/admin \
       --env=NEO4J_ACCEPT_LICENSE_AGREEMENT=yes \
       neo4j:enterprise

# Wait until the database is up and ready
echo "Waiting neo4j"
until $(curl --output /dev/null --silent --head --fail http://localhost:17474); do
  printf '.'
  sleep 1
done

# Load the data with the cypher shell
echo "Init database"
cat test_neo4j.cyp | docker exec -i neo4j_operator_test bin/cypher-shell -u neo4j -p admin
