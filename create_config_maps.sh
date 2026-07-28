#!/bin/bash
set -euo pipefail

VALID_BUILD_TARGETS=("hub" "cas" "c9088" "elter-ri")

usage() {
  cat <<EOF
Usage: $0 --namespace <ns> [--target <target>] [--skip-build] [--dry-run] [--local]

Build a hub frontend and publish its static files as Kubernetes ConfigMaps.

Options:
  --namespace <ns>   Kubernetes namespace to apply ConfigMaps to (required)
  --target <target>  Build target: ${VALID_BUILD_TARGETS[*]} (default: hub)
  --skip-build       Skip 'bun install' + build, reuse existing dist directory
  --local            Generate ConfigMap YAML files locally instead of applying to the cluster
  --dry-run          Print the kubectl commands without applying any changes
  -h, --help         Show this help and exit

Examples:
  $0 --target cas --namespace jupyterhub-cas-ns
  $0 --namespace jupyterhub-dev-ns --dry-run --skip-build
EOF
}

BUILD_TARGET="hub"
NAMESPACE=""
SKIP_BUILD=false
LOCAL=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      BUILD_TARGET="${2:?--target requires a value}"
      shift 2
      ;;
    --namespace)
      NAMESPACE="${2:?--namespace requires a value}"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --local)
      LOCAL=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown option '$1'" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! " ${VALID_BUILD_TARGETS[*]} " =~ " ${BUILD_TARGET} " ]]; then
  echo "Error: invalid --target '${BUILD_TARGET}'. Valid targets: ${VALID_BUILD_TARGETS[*]}" >&2
  exit 1
fi

if [[ -z "$NAMESPACE" ]]; then
  echo "Error: --namespace is required." >&2
  usage >&2
  exit 1
fi

BASE_DIR="./dist_${BUILD_TARGET}"

if [[ "$SKIP_BUILD" == true ]]; then
  echo "Skipping build; using existing $BASE_DIR"
else
  echo "Running build for target: $BUILD_TARGET"
  bun install
  bun run "build:$BUILD_TARGET"
fi

create_configmap() {
  local name=$1
  local path=$2

  if [[ "$DRY_RUN" == true ]]; then
    if [[ "$LOCAL" == true ]]; then
      echo "[dry-run] kubectl create configmap $name --from-file=$path --namespace $NAMESPACE --dry-run=client -o yaml > ${name}.yaml"
    else
      echo "[dry-run] kubectl delete configmap $name --namespace $NAMESPACE --ignore-not-found"
      echo "[dry-run] kubectl create configmap $name --from-file=$path --namespace $NAMESPACE"
    fi
  elif [[ "$LOCAL" == true ]]; then
    kubectl create configmap "$name" --from-file="$path" --namespace "$NAMESPACE" --dry-run=client -o yaml > "${name}.yaml"
    echo "Generated ${name}.yaml"
  else
    kubectl delete configmap "$name" --namespace "$NAMESPACE" --ignore-not-found
    kubectl create configmap "$name" --from-file="$path" --namespace "$NAMESPACE"
  fi
}

create_configmap "static-files" "$BASE_DIR"
create_configmap "static-files-js" "$BASE_DIR/static/custom-js"
create_configmap "static-files-css" "$BASE_DIR/static/custom-css"
create_configmap "static-files-woff" "$BASE_DIR/static/woff"
create_configmap "static-files-woff2" "$BASE_DIR/static/woff2"
create_configmap "static-files-images" "$BASE_DIR/static/custom-images"

echo "All ConfigMaps processed successfully."
