{{/*
Generate certificate name from domain
*/}}
{{- define "traefik-gateway.certName" -}}
{{- .Values.domain | replace "." "-" | printf "wildcard-%s" -}}
{{- end -}}

{{/*
Generate secret name for TLS certificate
*/}}
{{- define "traefik-gateway.certSecretName" -}}
{{- include "traefik-gateway.certName" . -}}-tls
{{- end -}}
