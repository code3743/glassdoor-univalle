#!/bin/bash
minikube start
if [ $? -ne 0 ]; then
  echo "Error iniciando Minikube"
  exit 1
fi


kubectl create configmap init-db-sql --from-file=./db/init/init-db.sql
if [ $? -ne 0 ]; then
  echo "Error creando ConfigMap"
  exit 1
fi



kubectl apply -f backend-deployment.yml
if [ $? -ne 0 ]; then
  echo "Error aplicando backend-deployment.yml"
  exit 1
fi

kubectl apply -f frontend-deployment.yml
if [ $? -ne 0 ]; then
  echo "Error aplicando frontend-deployment.yml"
  exit 1
fi

kubectl apply -f postgres-deployment.yml
if [ $? -ne 0 ]; then
  echo "Error aplicando postgres-deployment.yml"
  exit 1
fi

kubectl apply -f postgres-pvc.yml
if [ $? -ne 0 ]; then
  echo "Error aplicando postgres-pvc.yml"
  exit 1
fi


kubectl rollout status deployment/backend-deployment
kubectl rollout status deployment/frontend-deployment
kubectl rollout status deployment/postgres-deployment

minikube service frontend