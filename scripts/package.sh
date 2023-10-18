#!/bin/bash

usage() {
	echo "Usage: $0 [ -n NEW ] [ -d DELETE ]" 1>&2
}
exit_abnormal() {
	usage
	exit 1
}

install_package() {
	PACKAGE_NAME=$1
	PACKAGE_DIR="packages/$PACKAGE_NAME"

	echo "Installing package $PACKAGE_NAME in $PACKAGE_DIR..."

	mkdir -p "$PACKAGE_DIR/src"

	cat <<EOF >"./$PACKAGE_DIR"/tsconfig.json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "rootDir": "src",
      "outDir": "lib",
      "declarationDir": "lib/types"
    },
    "include": ["src"],
    "exclude": ["lib"]
  }
EOF

	cat <<EOF >"./$PACKAGE_DIR"/package.json
{
  "name": "@geomm/$PACKAGE_NAME",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "module": "./lib/index.js",
  "typings": "./lib/types/index.d.ts",
  "keywords": [],
  "author": "Josh Murr",
  "license": "ISC",
  "scripts": {
    "build": "tsc"
  },
  "files": [
    "./lib/**/*.js",
    "./lib/**/*.d.ts"
  ],
  "exports": {
    ".": {
      "default": "./lib/index.js"
    },
  },
  "dependencies": {
    "@geomm/api": "*"
  }
}
EOF

	# Add reference in root tsconfig.json so that it builds
	TSCONFIG_REF="{ \"path\": \"$PACKAGE_DIR\" },"
	printf '$-2i\n    %s\n.\nw\n' "$TSCONFIG_REF" | ed -s "./tsconfig.json"

	# Refresh monorepo
	npm i &>/dev/null

	echo "Done installing $PACKAGE_NAME."
}

uninstall_package() {
	PACKAGE_NAME=$1
	PACKAGE_DIR="packages/$PACKAGE_NAME"

	echo "Uninstalling package $PACKAGE_NAME in $PACKAGE_DIR.."

	# Uninstall from all workspaces
	npm uninstall --workspaces "@geomm/$PACKAGE_NAME"

	rm -rf $PACKAGE_DIR
	sed -i "/$PACKAGE_NAME/d" /home/josh/phd/geomm/tsconfig.json
	sed -i "/$PACKAGE_NAME/d" /home/josh/phd/geomm/package.json

	echo "Done uninstalling $PACKAGE_NAME."
}

while getopts ":n:d:" OPTION; do
	case "$OPTION" in
	n)
		install_package ${OPTARG}
		;;
	d)
		uninstall_package ${OPTARG}
		;;
	:) # If expected argument omitted:
		echo "Error: -${OPTARG} requires an argument."
		exit_abnormal
		;;
	*) # If unknown (any other) option:
		exit_abnormal
		;;
	esac
done
