FROM busybox:latest
COPY ./dist_hub/static /dist_hub/static
COPY ./dist_hub/*.html /dist_hub/html/
