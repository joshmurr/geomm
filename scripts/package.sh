#!/bin/bash

usage() {
	echo "Usage: $0 [ -i INSTALL ] [ -u UNINSTALL ]" 1>&2
}
exit_abnormal() {
	usage
	exit 1
}

install_package() {
	PACKAGE_NAME=$1
	PACKAGE_DIR="packages/$PACKAGE_NAME"

	echo "Installing package $PACKAGE_NAME in $PACKAGE_DIR..."

	npm init -y --scope @geomm -w "$PACKAGE_DIR"
	npm install -D typescript -w "$PACKAGE_DIR"

	mkdir -p "$PACKAGE_DIR/src"

	echo "{
  \"extends\": \"../../tsconfig.base.json\",
  \"compilerOptions\": {
    \"rootDir\": \"src\",
    \"outDir\": \"lib\"
  },
  \"include\": [\"src/**/*\"]
}" >"./$PACKAGE_DIR/tsconfig.json"

	echo "{
  \"name\": \"@geomm/$PACKAGE_NAME\",
  \"version\": \"1.0.0\",
  \"description\": \"\",
  \"main\": \"lib/index.js\",
  \"types\": \"lib/index.d.ts\",
  \"keywords\": [],
  \"author\": \"Josh Murr\",
  \"license\": \"ISC\",
}" >"./$PACKAGE_DIR/package.json"

	# Add reference in root tsconfig.json so that it builds
	TSCONFIG_REF="{ \"path\": \"$PACKAGE_DIR\" },"
	printf '$-2i\n    %s\n.\nw\n' "$TSCONFIG_REF" | ed -s "./tsconfig.json"

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

while getopts ":i:u:" OPTION; do
	case "$OPTION" in
	i)
		install_package ${OPTARG}
		;;
	u)
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
