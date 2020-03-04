#!/bin/bash

mongoimport --host mongo --db express-mongo -c users --type json --file /users.json --jsonArray && \
mongoimport --host mongo --db express-mongo -c products --type json --file /products.json --jsonArray && \
mongoimport --host mongo --db express-mongo -c orders --type json --file /orders.json --jsonArray && \
mongoimport --host mongo --db express-mongo -c counters --type json --file /counters.json --jsonArray && \
mongoimport --host mongo --db express-mongo -c categories --type json --file /categories.json --jsonArray