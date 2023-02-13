#!/usr/bin/bash
source ./scripts/trycatch.sh

# Define custom exception types
export ERR_PUB_FAIL=100
export ERR_WORSE=101
export ERR_CRITICAL=102

PACKAGES_DIR="./packages"

function publishAll {
	npm publish --access public --workspaces
}

function patchVersion {
	PACKAGE_NAME=$1
	CMD="npm version patch --workspace=$PACKAGES_DIR/$PACKAGE_NAME"
	echo
	echo "Patching: $PACKAGE_NAME"
	echo
	$CMD
}

function publishEachPackage {
	for PACKAGE_NAME in $(ls -1 $PACKAGES_DIR); do
		PUBLISH_CMD="npm publish --access public --workspace=$PACKAGES_DIR/$PACKAGE_NAME"
		echo "Running: $CMD"
		echo
		try
		(
			$PUBLISH_CMD || throw $ERR_PUB_FAIL
		)

		catch || {
			case $exception_code in
			$ERR_PUB_FAIL)
				echo
				echo "Publish failed. Patching version and trying again..."
				echo
				patchVersion $PACKAGE_NAME
				$PUBLISH_CMD
				;;
			*)
				echo "Unknown error: $exit_code"
				throw $exit_code # re-throw an unhandled exception
				;;
			esac
		}

	done
}

publishEachPackage
