#! /bin/bash
environment="${ENVIRONMENT}"
flyway repair  -configFiles=/flyway/flyway.conf
flyway migrate -ignoreMissingMigrations=true -configFiles=/flyway/flyway.conf
node server.js
