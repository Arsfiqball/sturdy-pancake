# Sejuta Cita REST API Test

## Architecture

## Running on Kubernetes
Create random 32 characters string for app key.
```sh
openssl rand -base64 32
```

Change `generatedappkey` with random characters above and run it.
```sh
kubectl create secret generic app-secret --from-literal=secret-key='generatedappkey'
```

Run App and MongoDB kubes (see directory `kubes/`).
```sh
kubectl apply -f kubes
```

If you are in local, you can check the URL here and navigate to `/docs` path.
```sh
minikube service sturdy-pancake --url
```

## Manual Run

## Manual Test
