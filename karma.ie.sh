#!/bin/bash

export IE_BIN="/c/Program Files/Internet Explorer/iexplore.exe"
cd /c/
if [ ! -d "./ng-mocks-sandbox/" ]; then
  mkdir ng-mocks-sandbox
fi
cd ng-mocks-sandbox

find /z/ng-mocks-sandbox -maxdepth 1 -not -name ng-mocks-sandbox -not -name .git -not -name e2e -not -name node_modules -exec cp -rf {} . \;

if [ ! -d "./node_modules/" ]; then
  npm ci --no-optional --ignore-scripts && \
  ./node_modules/.bin/ngcc
fi

npm run test ng-mocks-sandbox -- --reporters=dots --browsers=IECi
