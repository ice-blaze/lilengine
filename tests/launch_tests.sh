#!/usr/bin/env bash

npm run pack

# check if selenium is installed
node_modules/.bin/webdriver-manager update
selePort="4444"
httpPort="8329"

# start selenium server just for this test run
(node_modules/.bin/webdriver-manager start &)
# Wait for port 4444 to be listening connections
while ! nc -z 127.0.0.1 $selePort; do sleep 2; done

# Start the web app
(node_modules/.bin/http-server -p $httpPort &)
# Guessing your http-server listen at port 80
while ! nc -z 127.0.0.1 $httpPort; do sleep 1; done

# Finally run protractor
node_modules/.bin/protractor .protractor.config.js

# Cleanup webdriver-manager and http-server processes
fuser -k -n tcp $selePort
fuser -k -n tcp $httpPort
