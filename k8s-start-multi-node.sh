#!/bin/bash

# Graph Bot Multi-Node Kubernetes Start Script
set -e

echo "Starting Graph Bot on Multi-Node Kubernetes cluster..."

# Check if multi-node cluster already exists
if kind get clusters 2>/dev/null | grep -q "graph-bot"; then
    echo "INFO: Deleting existing single-node cluster..."
    kind delete cluster --name graph-bot
fi

echo "INFO: Creating multi-node kind cluster..."
kind create cluster --config kind-multi-node.yaml

# Set kubectl context
kubectl config use-context kind-graph-bot

echo "INFO: Loading Docker images into cluster..."
kind load docker-image graph-bot-frontend:latest --name graph-bot
kind load docker-image graph-bot-backend:latest --name graph-bot
kind load docker-image graph-bot-python:latest --name graph-bot

echo "INFO: Deploying applications with node affinity..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployments-multi-node.yaml
kubectl apply -f k8s/services.yaml

echo "INFO: Waiting for pods to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n graph-bot
kubectl wait --for=condition=available --timeout=300s deployment/backend -n graph-bot
kubectl wait --for=condition=available --timeout=300s deployment/python-service -n graph-bot

echo "INFO: Setting up port forwarding..."
# Kill any existing port-forward processes
pkill -f "kubectl port-forward.*graph-bot" 2>/dev/null || true
sleep 2

# Start port forwarding in background
kubectl port-forward svc/frontend-lb 3000:80 -n graph-bot > /dev/null 2>&1 &
PORT_FORWARD_PID=$!

# Wait a moment for port forwarding to establish
sleep 3

echo ""
echo "SUCCESS: Multi-Node Graph Bot cluster is ready!"
echo "Application URL: http://localhost:3000"
echo ""
echo "Cluster Overview:"
kubectl get nodes -o wide
echo ""
echo "Pod Distribution:"
kubectl get pods -n graph-bot -o wide
echo ""
echo "Useful commands:"
echo "  kubectl get nodes --show-labels"
echo "  kubectl get pods -n graph-bot -o wide"
echo "  kubectl describe node <node-name>"
echo "  kubectl logs -f deployment/backend -n graph-bot"
echo "  ./k8s-stop.sh  # To stop everything"
echo ""
echo "Opening browser..."
open http://localhost:3000

echo "Port forwarding PID: $PORT_FORWARD_PID (use 'kill $PORT_FORWARD_PID' to stop)"
