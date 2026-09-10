# Worked examples · Exemplos comentados

[README](../README.md)

**English:** These are executable synthetic scenarios. Each command recomputes the committed report. Change one field at a time, retain the source file and inspect unfavorable findings as well as headline metrics.

**Português:** Estes são cenários sintéticos executáveis. Cada comando recalcula o relatório versionado. Altere um campo por vez, preserve a entrada e inspecione achados desfavoráveis junto das métricas principais.

## Closed course · Percurso fechado

```sh
node scripts/analyze.mjs examples/nominal.json report.json
```

[Scenario / Cenário](../examples/nominal.json) · [Expected report / Relatório esperado](../examples/nominal.report.json) · `complete`

| Metric · Métrica                                | Expected · Esperado |
| ----------------------------------------------- | ------------------- |
| Unique timestamps / Instantes únicos            | 6                   |
| Included distance / Distância incluída          | 2.5 m               |
| Excluded intervals / Intervalos excluídos       | 0                   |
| Peak included speed / Maior velocidade incluída | 0.5 m/s             |

## Missing observations · Observações ausentes

```sh
node scripts/analyze.mjs examples/missing-observations.json report.json
```

[Scenario / Cenário](../examples/missing-observations.json) · [Expected report / Relatório esperado](../examples/missing-observations.report.json) · `review-notes`

| Metric · Métrica                                | Expected · Esperado |
| ----------------------------------------------- | ------------------- |
| Unique timestamps / Instantes únicos            | 6                   |
| Included distance / Distância incluída          | 1.5 m               |
| Excluded intervals / Intervalos excluídos       | 2                   |
| Peak included speed / Maior velocidade incluída | 0.5 m/s             |

- `INVALID_SAMPLE`: An invalid sample cannot anchor an observed segment. / Uma amostra inválida não pode definir um segmento observado.
- `SAMPLE_GAP`: A 4000 ms gap is excluded from distance totals. / Um intervalo de 4000 ms foi excluído dos totais de distância.

## Conflicting timestamp · Instante conflitante

```sh
node scripts/analyze.mjs examples/conflicting-timestamp.json report.json
```

[Scenario / Cenário](../examples/conflicting-timestamp.json) · [Expected report / Relatório esperado](../examples/conflicting-timestamp.report.json) · `review-required`

| Metric · Métrica                                | Expected · Esperado |
| ----------------------------------------------- | ------------------- |
| Unique timestamps / Instantes únicos            | 6                   |
| Included distance / Distância incluída          | 1.5 m               |
| Excluded intervals / Intervalos excluídos       | 2                   |
| Peak included speed / Maior velocidade incluída | 0.5 m/s             |

- `OUT_OF_ORDER`: Input samples were reordered by timestamp. / As amostras foram reordenadas por instante de registro.
- `TIMESTAMP_CONFLICT`: Conflicting samples at one timestamp were marked invalid. / Amostras conflitantes no mesmo instante foram marcadas como inválidas.
- `INVALID_SAMPLE`: An invalid sample cannot anchor an observed segment. / Uma amostra inválida não pode definir um segmento observado.
