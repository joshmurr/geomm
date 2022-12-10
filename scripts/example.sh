#!/bin/bash

usage() {
	echo "Usage: $0 [ -n NEW ] [ -d DELETE ]" 1>&2
}

exit_abnormal() {
	usage
	exit 1
}

new_example() {
	EXAMPLE_NAME=$1
	EXAMPLE_DIR="examples/$EXAMPLE_NAME"
	echo "Adding new example '$EXAMPLE_NAME'"

	mkdir -p "./$EXAMPLE_DIR/src"

	cat <<EOF >"./$EXAMPLE_DIR"/src/index.ts
  const sanityCheck = (please: string): void => {
  console.log(\`Will you work \${please}.\`)
}

sanityCheck("for me.")
EOF

	echo "writing package.json..."
	cat <<EOF >"./$EXAMPLE_DIR"/package.json
{
	"name": "@example/$1",
	"version": "0.0.1",
	"private": true,
	"description": "TODO",
	"repository": "https://github.com/joshmurr/geomm",
	"author": "Josh Murr",
	"scripts": {
		"start": "vite --open",
		"build": "tsc && vite build --base='./'",
		"preview": "vite preview --host --open"
	},
	"devDependencies": {
		"typescript": "^4.9.4",
		"vite": "^3.2.0"
	},
	"dependencies": {
		"@geomm/api": "^1.0.0"
	},
	"browser": {
		"process": false
	}
}
EOF

	echo "writing tsconfig.json..."
	cat <<EOF >"$EXAMPLE_DIR"/tsconfig.json
{
	"extends": "../tsconfig.json",
	"include": ["src/**/*"],
	"compilerOptions": {
	}
}
EOF

	echo "writing index.html..."
	cat <<EOF >"$EXAMPLE_DIR"/index.html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>$1 · @geomm</title>
	<style>
	</style>
</head>
<body>
	<script type="module" src="/src/index.ts"></script>
</body>
</html>
EOF

	npm i

	echo "Done creating new example '$EXAMPLE_DIR'."
}

delete_example() {
	EXAMPLE_NAME=$1
	EXAMPLE_DIR="examples/$EXAMPLE_NAME"

	echo "Deleting example '$EXAMPLE_NAME'"

	rm -rf "./$EXAMPLE_DIR"

	echo "Done deleting '$EXAMPLE_NAME'."
}

while getopts ":n:d:" OPTION; do
	case "$OPTION" in
	n)
		new_example ${OPTARG}
		;;
	d)
		delete_example ${OPTARG}
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
