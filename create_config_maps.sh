#!/bin/bash

npm install
npm run build

NAMESPACE="jupyterhub-dev-ns"
BASE_DIR="./dist"

create_configmap() {
  local name=$1
  local path=$2

  # applying the ConfigMaps directly to cluster
  kubectl delete configmap $name --namespace $NAMESPACE --ignore-not-found
  kubectl create configmap $name --from-file=$path --namespace $NAMESPACE
  # creating the ConfigMaps locally
  kubectl create configmap $name --from-file=$path --dry-run=client -o yaml > $name.yaml
}

create_configmap "static-files" "$BASE_DIR"
create_configmap "static-files-js" "$BASE_DIR/static/custom-js"
create_configmap "static-files-css" "$BASE_DIR/static/custom-css"
create_configmap "static-files-woff" "$BASE_DIR/static/woff"
create_configmap "static-files-woff2" "$BASE_DIR/static/woff2"
create_configmap "static-files-images" "$BASE_DIR/static"

echo "All ConfigMaps processed successfully."
