#!/bin/bash

cd $(dirname $(readlink -f $0))/..
VALUE=$(cat module-config.json | grep -o '"[^"]*"\s*:\s*"[^"]*"' | grep -E '^"(namespace)"' | cut -d ":" -f2- | sed 's/\"//g' | sed 's/\///g') 

tarantoolctl rocks build
tarantoolctl rocks pack $VALUE