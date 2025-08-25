#!/bin/bash
echo "🚀 Starting persistent port forwarding for Graph Bot..."
while true; do
    echo "$(date): Starting port forward..."
    kubectl port-forward svc/frontend-lb 3000:80 -n graph-bot
    echo "$(date): Port forward stopped, restarting in 2 seconds..."
    sleep 2
done
