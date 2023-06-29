#!/bin/bash

for dir in $(ls -1 ./examples); do
	cd ./examples/$dir
	npm install vite@latest
	cd ../..
done
