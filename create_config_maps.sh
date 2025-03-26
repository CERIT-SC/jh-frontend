#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 namespace_or_build_target"
  echo "Example: $0 jupyterhub-dev-ns"
  exit 1
fi

INPUT=$1

# Define default namespace and valid build targets
DEFAULT_NAMESPACE="jupyterhub-dev-ns"
VALID_BUILD_TARGETS=("cas" "c9088" "hub" "elter")

# Determine if the input is a namespace or build target
if [[ " ${VALID_BUILD_TARGETS[@]} " =~ " $INPUT " ]]; then
  BUILD_TARGET=$INPUT
  NAMESPACE=""
else
  BUILD_TARGET="hub"
  NAMESPACE=$INPUT
fi


BASE_DIR="./dist_$BUILD_TARGET"

# Run npm commands
if [ -n "$BUILD_TARGET" ]; then
  echo "Running build for target: $BUILD_TARGET"
  npm install
  npm run build:$BUILD_TARGET
else
  echo "Using namespace: $NAMESPACE"
  npm install
  npm run build
fi

# Create ConfigMaps
create_configmap() {
  local name=$1
  local path=$2

  # Don't delete ConfigMaps from the cluster automatically
  if [ "$NAMESPACE" = "$DEFAULT_NAMESPACE" ]; then
#    kubectl delete configmap $name --namespace $NAMESPACE --ignore-not-found
    kubectl create configmap $name --from-file=$path --namespace $NAMESPACE
  else
    # Creating the ConfigMaps locally
    kubectl create configmap $name --from-file=$path --dry-run=client -o json > $name.json
    kubectl patch --local -f $name.json --type=json -p='[{"op": "remove", "path": "/metadata/creationTimestamp"}]' -o yaml > $name.yaml
    rm $name.json
  fi
}

create_configmap "static-files" "$BASE_DIR"
create_configmap "static-files-js" "$BASE_DIR/static/custom-js"
create_configmap "static-files-css" "$BASE_DIR/static/custom-css"
create_configmap "static-files-woff" "$BASE_DIR/static/woff"
create_configmap "static-files-woff2" "$BASE_DIR/static/woff2"
create_configmap "static-files-images" "$BASE_DIR/static/custom-images"

echo "All ConfigMaps processed successfully."
