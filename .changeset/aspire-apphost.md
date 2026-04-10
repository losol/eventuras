---
"@eventuras/api": minor
---

Add .NET Aspire for local development orchestration and observability. Run `dotnet run --project src/Eventuras.AppHost` to start PostgreSQL and the API with an Aspire Dashboard for real-time logs, traces, and metrics. OpenTelemetry exports to Grafana (Prometheus/Loki/Tempo) when `OTEL_EXPORTER_OTLP_ENDPOINT` is set.
