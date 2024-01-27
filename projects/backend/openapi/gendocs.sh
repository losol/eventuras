#!/bin/bash

SCRIPT=$(basename "$0")
OUT_DIR=out-api-docs
GEN_HTML=1
GEN_YAML=1
GEN_JSON=1
HTML_FORMAT=html
YAML_FILE_NAME=
JSON_FILE_NAME=

HELP=$(cat <<EOF
${SCRIPT} [OPTIONS] path/to/spec.yaml
Options:
  -o	Output directory. Default: ${OUT_DIR}.
  -a	Use alternative HTML format.
  -H	Do not generate HTML.
  -J	Do not generate JSON schema.
  -Y	Do not generate YAML schema.
  -y	Generated YAML spec file name. Default is the same as the input spec file name.
  -j	Generated JSON spec file name. Default is the same as the input spec file name plus .json suffix.
EOF
)

NPM=`which npm`
if [ -z "$NPM" ]; then
  echo "This script requires npm."
  exit 1
fi

MAIN_JS=node_modules/@openapitools/openapi-generator-cli/main.js
if [ ! -f "$MAIN_JS" ]; then
  npm install @openapitools/openapi-generator-cli -D
fi

while getopts ":o:y:j:aHJY" opt; do
  case ${opt} in
    o )
      OUT_DIR=$OPTARG
      ;;
    y )
      YAML_FILE_NAME=$OPTARG
      ;;
    j )
      JSON_FILE_NAME=$OPTARG
      ;;
    a )
      HTML_FORMAT=html2
      ;;
    H )
      GEN_HTML=0
      ;;
    J )
      GEN_JSON=0
      ;;
    Y )
      GEN_YAML=0
      ;;
    * )
      echo "Invalid Option: -$OPTARG" 1>&2
      echo "Usage: ${HELP}"
      exit 1
      ;;
  esac
done

shift $((OPTIND-1))

if [ $# -eq 0 ]; then
  echo "Usage: ${HELP}"
  exit 1
fi

SPEC=$1
shift 1

gen_html() {
  $MAIN_JS generate -i $SPEC -g $HTML_FORMAT -o $OUT_DIR --global-property skipFormModel=true > /dev/null
}

gen_yaml() {
  if [ "$YAML_FILE_NAME" == "" ]; then
    YAML_FILE_NAME=$(basename "$SPEC")
  fi
  $MAIN_JS generate -i $SPEC -g openapi-yaml -o $OUT_DIR -p outputFile=$YAML_FILE_NAME > /dev/null
}

gen_json() {
  if [ "$JSON_FILE_NAME" == "" ]; then
    JSON_FILE_NAME="$(basename "$SPEC").json"
  fi
  $MAIN_JS generate -i $SPEC -g openapi -o $OUT_DIR -p outputFile=$JSON_FILE_NAME > /dev/null
}

[ "$GEN_HTML" -eq "1" ] && gen_html
[ "$GEN_YAML" -eq "1" ] && gen_yaml
[ "$GEN_JSON" -eq "1" ] && gen_json
