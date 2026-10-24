# Guided evidence tour · Visita guiada às evidências

[README](../README.md) · [Validation / Validação](../docs/VALIDATION.md)

## The question · A pergunta

**EN:** Which trajectory intervals have enough evidence to include?

**PT:** Quais intervalos de trajetória têm evidência suficiente para inclusão?

## First result · Primeiro resultado

Unique timestamps / Instantes Ãºnicos: **6 **; Included distance / DistÃ¢ncia incluÃ­da: **1.5 m**; Excluded intervals / Intervalos excluÃ­dos: **2 **

**EN:** These are committed examples of software behavior. Follow the installation and execution commands in the [README](../README.md#english); the source inputs and expected outputs below allow inspection before installation.

**PT:** São exemplos versionados do comportamento do software. Siga a instalação e os comandos do [README](../README.md#portugues); as entradas e saídas abaixo permitem inspecionar o resultado antes de instalar.

## Compare one assumption · Compare uma premissa

**EN:** Compare nominal, missing observations and conflicting timestamps; inspect exclusions before summing distance. Keep the original input, change a copy, rerun the implementation and compare the complete output, including warnings and excluded records.

**PT:** Compare o nominal, observações ausentes e instantes conflitantes; inspecione exclusões antes de somar distâncias. Preserve a entrada original, altere uma cópia, execute novamente e compare a saída completa, incluindo avisos e registros excluídos.

## Inputs and expected outputs · Entradas e saídas esperadas

| Input · Entrada | Expected output · Saída esperada | Inspect · Inspecione |
| --- | --- | --- |
| [conflicting-timestamp.json](../examples/conflicting-timestamp.json) | [conflicting-timestamp.report.json](../examples/conflicting-timestamp.report.json) | Unique timestamps / Instantes Ãºnicos: **6 **; Included distance / DistÃ¢ncia incluÃ­da: **1.5 m**; Excluded intervals / Intervalos excluÃ­dos: **2 ** |
| [missing-observations.json](../examples/missing-observations.json) | [missing-observations.report.json](../examples/missing-observations.report.json) | Unique timestamps / Instantes Ãºnicos: **6 **; Included distance / DistÃ¢ncia incluÃ­da: **1.5 m**; Excluded intervals / Intervalos excluÃ­dos: **2 ** |
| [nominal.json](../examples/nominal.json) | [nominal.report.json](../examples/nominal.report.json) | Unique timestamps / Instantes Ãºnicos: **6 **; Included distance / DistÃ¢ncia incluÃ­da: **2.5 m**; Excluded intervals / Intervalos excluÃ­dos: **0 ** |

## Review the evidence · Revise as evidências

1. **Input / Entrada:** identify units, identifiers and assumptions before interpreting a result. / Identifique unidades, identificadores e premissas antes de interpretar o resultado.
2. **Implementation / Implementação:** follow the domain code linked in the README. / Acompanhe o código de domínio indicado no README.
3. **Output / Saída:** compare both the headline and the complete record. / Compare o destaque e o registro completo.
4. **Checks / Verificações:** read [validation notes](../docs/VALIDATION.md) and the current workflow result. / Leia as [notas de validação](../docs/VALIDATION.md) e o resultado atual da automação.

**EN:** The banner illustrates the workflow; it is not a screenshot. Example values describe the supplied scenarios. They do not establish physical performance, institutional endorsement or an outcome beyond the documented software scope. Domain-specific assumptions and limitations remain in the README and method documents.

**PT:** O banner ilustra o fluxo; não é uma captura de tela. Os valores descrevem os cenários fornecidos. Não estabelecem desempenho físico, endosso institucional ou resultado além do escopo documentado do software. Premissas e limites do domínio permanecem no README e nos documentos de método.
