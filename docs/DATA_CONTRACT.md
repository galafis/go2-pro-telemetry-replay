# Data contract · Contrato de dados

[README](../README.md) · [Machine-readable schema · Esquema para ferramentas](../schemas/scenario.schema.json)

## English

All inputs use schema version 1. Fields and units are explicit; numeric strings, nonfinite values and unknown fields are rejected. The structural JSON Schema assists editors and integrations. `validate()` in the domain engine also enforces semantic constraints such as ordering, uniqueness and cross-field relationships.

`source: "synthetic"` labels an illustrative scenario. `source: "manual"` means that a user supplied the values; it does not prove measurement, accuracy, permission or hardware origin. Keep original observation records separately when using manual data.

## Português

Todas as entradas usam a versão 1 do esquema. Campos e unidades são explícitos; números em texto, valores não finitos e campos desconhecidos são rejeitados. O JSON Schema estrutural auxilia editores e integrações. A função `validate()` também impõe restrições semânticas, como ordem, unicidade e relações entre campos.

`source: "synthetic"` identifica um cenário ilustrativo. `source: "manual"` significa que um usuário informou os valores; não comprova medição, precisão, autorização ou origem física. Mantenha os registros originais de observação separadamente ao usar dados manuais.

## Input fields · Campos de entrada

| Field · Campo   | English                                                         | Português                                                            |
| --------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| `schemaVersion` | Schema version; exactly 1                                       | Versão do esquema; exatamente 1                                      |
| `scenarioId`    | Public scenario code; no personal identifiers                   | Código público do cenário; sem identificadores pessoais              |
| `source`        | synthetic or manual; an explicit provenance label               | synthetic ou manual; rótulo explícito de origem                      |
| `maxGapMs`      | Maximum interval for distance inclusion and sample freshness    | Intervalo máximo para inclusão de distância e atualidade da amostra  |
| `speedLimitMps` | Analysis speed cutoff; not a hardware specification             | Limite de velocidade da análise; não é especificação do hardware     |
| `samples`       | Planar observations in metres, milliseconds and battery percent | Observações planas em metros, milissegundos e porcentagem de bateria |

## Complete nominal input · Entrada nominal completa

```json
{
  "schemaVersion": 1,
  "scenarioId": "closed-course",
  "source": "synthetic",
  "maxGapMs": 1500,
  "speedLimitMps": 2,
  "samples": [
    {
      "atMs": 0,
      "xM": 0,
      "yM": 0,
      "batteryPct": 80.0,
      "quality": "valid"
    },
    {
      "atMs": 1000,
      "xM": 0.5,
      "yM": 0,
      "batteryPct": 79.9,
      "quality": "valid"
    },
    {
      "atMs": 2000,
      "xM": 1,
      "yM": 0,
      "batteryPct": 79.8,
      "quality": "valid"
    },
    {
      "atMs": 3000,
      "xM": 1,
      "yM": 0.5,
      "batteryPct": 79.7,
      "quality": "valid"
    },
    {
      "atMs": 4000,
      "xM": 1,
      "yM": 1,
      "batteryPct": 79.6,
      "quality": "valid"
    },
    {
      "atMs": 5000,
      "xM": 0.5,
      "yM": 1,
      "batteryPct": 79.5,
      "quality": "valid"
    }
  ]
}
```

## Report envelope · Estrutura do relatório

| Field · Campo             | Meaning · Significado                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`           | Report format version · Versão do formato do relatório                                                                           |
| `analysisVersion`         | Version of the analysis implementation · Versão da implementação da análise                                                      |
| `projectId`, `scenarioId` | Public project and scenario codes · Códigos públicos de projeto e cenário                                                        |
| `source`                  | Input provenance label, preserved · Origem da entrada, preservada                                                                |
| `status`                  | `complete`, `review-notes` or `review-required`                                                                                  |
| `metrics`                 | Values with English/Portuguese labels and units · Valores com rótulos bilíngues e unidades                                       |
| `findings`                | Severity, stable code, bilingual message and optional context · Gravidade, código estável, mensagem bilíngue e contexto opcional |
| `records`                 | Full ordered domain result · Resultado de domínio completo e ordenado                                                            |

Additional project-specific fields are shown in the [complete nominal report](../examples/nominal.report.json). Stable field names remain in English in both interface languages to preserve interoperability.  
Campos específicos adicionais constam no [relatório nominal completo](../examples/nominal.report.json). Os nomes estáveis dos campos permanecem em inglês nos dois idiomas da interface para preservar a interoperabilidade.

## API

```js
import { run } from './src/engine.js';
const report = await run(scenario);
console.log(report.status, report.metrics);
```

Errors expose `code` and `localized.en` / `localized.pt`. No partially computed report is returned for invalid scenarios.  
Erros expõem `code` e `localized.en` / `localized.pt`. Cenários inválidos não retornam relatórios parcialmente calculados.
