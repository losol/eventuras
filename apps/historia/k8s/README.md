# Historia Kubernetes Deployment

Helm chart for deploying Historia CMS to Kubernetes.

## Structure

```text
k8s/
  Chart.yaml
  values.yaml           # Image defaults, resources, health checks
  templates/
    deployment.yaml
    service.yaml
```

ArgoCD Application(Set) and routing are managed externally (e.g. eventuras-infra).

## Secrets

Historia requires a Kubernetes secret named `historia-secrets` in the target namespace.
Use Infisical or create manually:

```bash
kubectl create secret generic historia-secrets \
  --namespace=<namespace> \
  --from-literal=CMS_DATABASE_URL="postgresql://..." \
  --from-literal=CMS_SECRET="..." \
  --from-literal=NEXT_PUBLIC_CMS_URL="https://cms.example.com"
```

## Local testing

```bash
helm template historia apps/historia/k8s/ --set image.tag=test
```
