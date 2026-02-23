{{/*
Shared non-sensitive env vars passed to the API Helm chart.
Usage: {{- include "eventuras-api.configEnv" . | nindent 10 }}
*/}}
{{- define "eventuras-api.configEnv" -}}
AppSettings__AllowedOrigins: {{ .Values.config.allowedOrigins | quote }}
Auth__Issuer: {{ .Values.config.auth.issuer | quote }}
Auth__Audience: {{ .Values.config.auth.audience | quote }}
Auth__ApiIdentifier: {{ .Values.config.auth.apiIdentifier | quote }}
FeatureManagement__UseSentry: {{ .Values.config.features.useSentry | quote }}
FeatureManagement__UsePowerOffice: {{ .Values.config.features.usePowerOffice | quote }}
{{- if .Values.config.converto.pdfEndpointUrl }}
Converto__PdfEndpointUrl: {{ .Values.config.converto.pdfEndpointUrl | quote }}
{{- end }}
{{- if .Values.config.converto.tokenEndpointUrl }}
Converto__TokenEndpointUrl: {{ .Values.config.converto.tokenEndpointUrl | quote }}
{{- end }}
{{- end }}
