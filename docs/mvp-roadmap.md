# Plano de Produto — MBTI (MVP.1 e MVP.2)

## 1) Escopo travado do MVP (entrega inicial)

### Incluir no **MVP.1** (pago funcional)
1. **Teste não adaptativo**
   - Questionário fixo com ordem predefinida de perguntas.
2. **Resultado básico**
   - Exibir tipo MBTI final (ex.: INFP) + descrição curta padronizada.
3. **Paywall**
   - Bloqueio da visualização completa do resultado premium por meio de tela de oferta.
4. **Compra premium**
   - Fluxo de checkout funcional com confirmação de compra e desbloqueio imediato.
5. **Relatório simples em HTML**
   - Página de relatório premium em HTML renderizada no app/web, sem exportação em PDF nesta fase.

### Explicitamente fora do MVP.1
- PDF de relatório.
- Animações avançadas.
- Comparador de tipos.
- Histórico completo de testes.
- API pública.

---

## 2) Itens movidos para fase seguinte

Esses itens ficam planejados para pós-MVP.1, priorizados no ciclo de evolução:

- **Animações avançadas** (microinterações, transições ricas, motion storytelling).
- **Comparador de tipos** (ex.: compatibilidade INFP x ENTJ).
- **Histórico completo** (timeline de tentativas, evolução e consultas anteriores).
- **API pública** (endpoints documentados para integrações externas).

---

## 3) Backlog MoSCoW por sprint com critérios objetivos de aceite

## Sprint 1 — Base funcional do teste + monetização mínima

### Must
1. **Fluxo de teste não adaptativo ponta a ponta**
   - **Aceite objetivo:** usuário consegue iniciar, responder 100% das perguntas e finalizar em uma única sessão sem erro bloqueante; taxa de erro JS crítica no fluxo < 1% das sessões do teste.
2. **Cálculo e exibição de resultado básico MBTI**
   - **Aceite objetivo:** para 20 casos de validação pré-definidos, o tipo retornado corresponde ao esperado em 100% dos casos.
3. **Paywall após resultado resumido**
   - **Aceite objetivo:** usuários não premium visualizam apenas resumo limitado e CTA de compra; conteúdo premium não aparece sem flag de acesso premium.
4. **Compra premium funcional**
   - **Aceite objetivo:** fluxo de pagamento sandbox aprovado em 10/10 tentativas de QA, com desbloqueio premium em até 5 segundos após confirmação.

### Should
1. **Persistência de sessão do teste (retomar progresso)**
   - **Aceite objetivo:** ao recarregar página no mesmo dispositivo/logado, progresso recuperado com perda máxima de 1 questão respondida.
2. **Eventos de analytics essenciais instrumentados**
   - **Aceite objetivo:** eventos `test_started`, `test_completed`, `paywall_viewed`, `checkout_started`, `premium_purchased` chegando com taxa de entrega >= 98% no ambiente de produção.

### Could
1. **A/B simples de copy no paywall**
   - **Aceite objetivo:** duas variações configuráveis sem deploy de código (via config/feature flag).

### Won’t (neste sprint)
- PDF, radar visual, animações avançadas, comparador e API pública.

---

## Sprint 2 — Robustez de premium + base do MVP.2

### Must
1. **Relatório premium HTML completo (sem PDF)**
   - **Aceite objetivo:** relatório inclui pelo menos: tipo MBTI, forças, pontos de atenção, recomendações práticas; disponível em 100% dos usuários premium ativos.
2. **Validação de acesso premium (guardas de rota/conteúdo)**
   - **Aceite objetivo:** nenhuma rota premium acessível por usuário não premium em testes automatizados de permissão (0 falhas).
3. **Medição de métricas principais em dashboard**
   - **Aceite objetivo:** dashboard diário com taxa de conclusão e taxa de conversão premium disponível para produto/negócio, com atualização em D+1.

### Should
1. **Melhorias visuais preparatórias para MVP.2**
   - **Aceite objetivo:** checklist de UI (tipografia, espaçamento, hierarquia) aplicado nas telas de teste, paywall e relatório.
2. **Estrutura técnica para exportação futura (PDF)**
   - **Aceite objetivo:** relatório HTML estruturado em seções reutilizáveis que suportem renderização server-side sem refatoração ampla.

### Could
1. **Protótipo de gráfico radar para traits**
   - **Aceite objetivo:** componente visual renderiza dados mock em ambiente de staging.

### Won’t (neste sprint)
- API pública e comparador completo de tipos.

---

## 4) Métricas principais do MVP

## North-star do MVP
- **Taxa de conclusão do teste**
- **Taxa de conversão para premium**

### Definições operacionais
1. **Taxa de conclusão do teste (TCT)**
   - Fórmula: `TCT = usuários que concluíram o teste / usuários que iniciaram o teste`
   - Janela padrão: diária e semanal.
   - Segmentações mínimas: dispositivo (mobile/desktop), origem de tráfego e país.

2. **Taxa de conversão para premium (TCP)**
   - Fórmula principal: `TCP = usuários que compraram premium / usuários que visualizaram paywall`
   - Fórmula complementar (funil total): `compradores premium / iniciaram teste`
   - Janela padrão: diária e semanal.

### Metas iniciais sugeridas (ajustáveis após 2 semanas)
- **TCT >= 65%**
- **TCP >= 4%** (paywall → compra)

---

## 5) Planejamento de releases

## Release **MVP.1** (pago funcional)
**Objetivo:** validar proposta de valor + disposição de pagamento com escopo enxuto.

**Conteúdo da release:**
- Teste não adaptativo.
- Resultado básico MBTI.
- Paywall funcional.
- Checkout/compra premium.
- Relatório premium simples em HTML (sem PDF).
- Instrumentação mínima de funil.

**Critério de Go/No-Go:**
- Fluxo de ponta a ponta sem bloqueios críticos.
- Métricas sendo coletadas corretamente.
- Taxa de erro crítica < 1% nas telas principais.

## Release **MVP.2** (valor percebido aumentado)
**Objetivo:** elevar percepção de qualidade e retenção pós-compra.

**Conteúdo da release:**
- Exportação **PDF** do relatório.
- **Radar** de traços/perfil.
- Melhorias visuais e de experiência (incluindo animações selecionadas).

**Critério de Go/No-Go:**
- PDF gerado com layout consistente em desktop/mobile.
- Radar validado com dados reais.
- Melhora mensurável nas métricas secundárias (tempo na página de relatório, share rate ou NPS pós-resultado).
