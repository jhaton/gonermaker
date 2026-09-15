SHELL := /bin/bash

.PHONY: setup dev test build preview clean

setup: node_modules/.package-lock.json

node_modules/.package-lock.json: package.json package-lock.json
	mise exec -- npm ci

dev: setup
	mise exec -- npm run dev -- --host 127.0.0.1

test: setup
	mise exec -- npm run build

build: setup
	mise exec -- npm run build

preview: build
	mise exec -- npm run preview -- --host 127.0.0.1

clean:
	rm -rf dist
