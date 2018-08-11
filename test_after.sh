#!/bin/bash

# Shutdown and remove old container
echo "Delete container"
docker rm -f neo4j_operator_test
