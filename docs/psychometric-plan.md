# Plano psicométrico e comercial (calibração inicial)

## 1) Métricas-alvo

Metas mínimas para liberar cobrança premium:

- **Consistência interna global (Cronbach's alpha)**: `>= 0.70`.
- **Consistência interna por dimensão (E/I, S/N, T/F, J/P)**: `>= 0.60`.
- **Estabilidade temporal (teste-reteste)**: correlação `>= 0.75` após 10–14 dias.
- **Correlação curta vs completa**: `>= 0.80`.
- **Correlação adaptativa vs completa**: `>= 0.80`.
- **Erro médio por dimensão (modelo escolhido)**: `<= 0.20`.
- **Confiança média de perfil**: `>= 0.68`.
- **Tamanho mínimo de amostra para decisão comercial**: `>= 30` respostas reais.

## 2) Dataset de calibração inicial (piloto)

Arquivo base: `data/calibration/pilot-sample.json`.

Cada registro contém:
- respostas da versão completa (`responses.full`),
- respostas da versão curta (`responses.short`),
- respostas da versão adaptativa (`responses.adaptive`),
- reteste da versão completa (`retest.full`),
- feedback subjetivo de clareza (`clarityFeedback.rating` + `clarityFeedback.comment`).

## 3) Comparação offline (regras vs adaptativo)

Executar:

```bash
pnpm analyze:calibration
```

A análise offline faz:

- validação estrutural do dataset (tamanho de vetores e faixa de rating),
- alpha global e alpha por dimensão,
- bootstrap 95% para alpha global e teste-reteste,
- correlação: curta vs completa e adaptativa vs completa,
- erro médio por dimensão para baseline de **regras** e versão **adaptativa**,
- seleção de modelo preferido com base no menor erro.

Saída:

- resumo no terminal,
- relatório estruturado em `docs/calibration/latest-report.json`.

## 4) Go/No-Go para premium

O gate premium é **GO** apenas se **todos** os critérios forem satisfeitos.
Caso um único item falhe, resultado é **NO-GO**.

Isso evita cobrar por um relatório com baixa confiabilidade psicométrica.

## 5) Transparência no relatório para usuário final

O relatório exibido ao usuário mostra:

- confiança do perfil (%),
- pior dimensão (%),
- indicador de confiança por dimensão com barra de progresso,
- classificação da confiança por dimensão (baixa/média/alta),
- status do gate premium (`GO` ou `NO-GO`).
