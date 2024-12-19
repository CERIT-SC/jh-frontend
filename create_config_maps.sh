#!/bin/bash

npm install
npm run build

NAMESPACE="jupyterhub-ns"
BASE_DIR="./dist"

create_configmap() {
  local name=$1
  local path=$2

  # applying the ConfigMaps directly to cluster

  # don't delete configmaps from cluster automatically! if ns changes, it could lead to catastrophe
  #  kubectl delete configmap $name --namespace $NAMESPACE --ignore-not-found
  #  kubectl create configmap $name --from-file=$path --namespace $NAMESPACE
  # creating the ConfigMaps locally
  kubectl create configmap $name --from-file=$path --dry-run=client -o json > $name.json
  kubectl patch --local -f $name.json --type=json -p='[{"op": "remove", "path": "/metadata/creationTimestamp"}]' -o yaml > $name.yaml
  rm $name.json

}

create_configmap "static-files" "$BASE_DIR"
create_configmap "static-files-js" "$BASE_DIR/static/custom-js"
create_configmap "static-files-css" "$BASE_DIR/static/custom-css"
create_configmap "static-files-woff" "$BASE_DIR/static/woff"
create_configmap "static-files-woff2" "$BASE_DIR/static/woff2"
echo "All ConfigMaps processed successfully."
