import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';

const otlpBaseUrl = process.env.OTLP_BASE_URL ?? 'http://127.0.0.1:4318';

export const sdk = new NodeSDK({
  serviceName: 'workers',
  traceExporter: new OTLPTraceExporter({
    url: `${otlpBaseUrl}/v1/traces`,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${otlpBaseUrl}/v1/metrics`,
    }),
  }),
});

sdk.start();
