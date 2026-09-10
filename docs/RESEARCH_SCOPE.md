# Research scope · Escopo de pesquisa

## English

A read-only offline workbench for timestamped planar observations. It separates usable trajectory segments from gaps, invalid samples, conflicting timestamps and configured speed outliers.

The Unitree Go2 PRO is the reference platform for the planned supervised research workflow. This release provides offline software evidence and does not claim an implemented hardware connection.

Prepare a measured closed course and record independent observations using supported controls. Confirm any read-only interface before implementing a vendor adapter. Compare timestamp units, coordinate frame, validity flags and sampling intervals. Keep interrupted and incomplete records as part of the evaluation.

## Português

Uma bancada offline, somente de leitura, para observações planas com registro de tempo. Separa segmentos de trajetória utilizáveis de lacunas, amostras inválidas, instantes conflitantes e valores de velocidade acima do limite configurado.

O Unitree Go2 PRO é a plataforma de referência para o fluxo de pesquisa supervisionada planejado. Esta versão produz evidências de software offline e não afirma possuir conexão implementada com hardware.

Prepare um percurso fechado medido e registre observações independentes usando controles compatíveis. Confirme qualquer interface de leitura antes de implementar um adaptador do fabricante. Compare unidades de tempo, sistema de coordenadas, indicadores de validade e intervalos de amostragem. Mantenha registros interrompidos e incompletos na avaliação.

## Readiness · Estágio de desenvolvimento

| Layer · Etapa                                                     | Status · Estado                            | Evidence · Evidência                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Domain software · Software de domínio                             | Implemented · Implementado                 | Engine, tests, examples and reports · Mecanismo, testes, exemplos e relatórios                                |
| Browser and CLI · Navegador e linha de comando                    | Implemented · Implementado                 | Same calculation in both interfaces · Mesmo cálculo nas duas interfaces                                       |
| Vendor/device adapter · Adaptador de fabricante/dispositivo       | Future, conditional · Futuro, condicionado | Requires supported interface and separate implementation · Exige interface compatível e implementação própria |
| Physical validation · Validação física                            | Planned · Planejada                        | Measured, controlled comparison protocol · Protocolo medido de comparação controlada                          |
| Participant or field study · Estudo com participantes ou em campo | Not established · Não estabelecido         | Requires separate review and evidence · Exige revisão e evidências próprias                                   |

## Boundaries · Limites

The JSON format is a public project schema, not a Unitree wire protocol. There is no live robot connection, sensor decoder, localization correction or motion control. Included distance is a quality-filtered sum under supplied assumptions and can underestimate travel when data are excluded.

O formato JSON é um esquema público do projeto, não um protocolo de comunicação da Unitree. Não há conexão com robô, decodificação de sensores, correção de localização ou controle de movimento. A distância incluída é uma soma filtrada segundo hipóteses informadas e pode subestimar o percurso quando dados são excluídos.

Independent public research work. No vendor endorsement, institutional partnership, emergency-use validation, clinical efficacy or physical guidance guarantee is claimed.  
Trabalho público independente de pesquisa. Não se afirma endosso do fabricante, parceria institucional, validação para emergências, eficácia clínica ou garantia de orientação física.

## Platform reference · Referência da plataforma

Standard PRO is not listed for secondary development; custom access requires confirmation.  
A versão PRO padrão não é listada para desenvolvimento secundário; o acesso personalizado exige confirmação. [Unitree Go2 configuration table · Tabela oficial de configuração](https://www.unitree.com/go2/) — checked / consultada: 2026-09-10.

The existence of an SDK does not establish that a particular purchased configuration exposes its interfaces.  
A existência de um SDK não comprova que uma configuração adquirida ofereça suas interfaces. [Official SDK repository · Repositório oficial do SDK](https://github.com/unitreerobotics/unitree_sdk2).
