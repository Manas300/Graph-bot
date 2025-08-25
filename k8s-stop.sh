#!/bin/bash

# Graph Bot Kubernetes Stop Script
set -e

echo "Stopping Graph Bot Kubernetes deployment..."

# Stop port forwarding
echo "INFO: Stopping port forwarding..."
pkill -f "kubectl port-forward.*graph-bot" 2>/dev/null || true
sleep 2

# Check if cluster exists before trying to delete
if kind get clusters 2>/dev/null | grep -q "graph-bot"; then
    echo "INFO: Deleting kind cluster..."
    kind delete cluster --name graph-bot
    echo "SUCCESS: Cluster deleted successfully"
else
    echo "INFO: No 'graph-bot' cluster found"
fi

echo ""
echo "Cleanup complete!"
echo ""
echo "To restart later, run:"
echo "  ./k8s-start.sh"
