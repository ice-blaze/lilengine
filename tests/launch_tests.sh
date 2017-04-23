#!/usr/bin/env bash
# TODO add an webdriver update before the start
# start selenium server just for this test run
(node_modules/.bin/webdriver-manager start &)
# Wait for port 4444 to be listening connections
while ! nc -z 127.0.0.1 4444; do sleep 2; done

# Start the web app
(node_modules/.bin/http-server . &)
# Guessing your http-server listen at port 80
while ! nc -z 127.0.0.1 8080; do sleep 1; done

# Finally run protractor
node_modules/.bin/protractor .protractor.config.js

# Cleanup webdriver-manager and http-server processes
fuser -k -n tcp 4444
fuser -k -n tcp 8080
