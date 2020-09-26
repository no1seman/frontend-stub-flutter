#!/bin/bash

cd $(dirname $(readlink -f $0))/..
VALUE=$(cat module-config.json | grep -o '"[^"]*"\s*:\s*"[^"]*"' | grep -E '^"(flutterAppPath)"' | cut -d ":" -f2- | sed 's/\"//g' | sed 's/\///g') 
cd $VALUE
flutter build web --release