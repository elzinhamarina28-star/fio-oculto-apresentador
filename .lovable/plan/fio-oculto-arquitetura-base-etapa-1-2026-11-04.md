# Fio Oculto — Arquitetura base (etapa 1)

## Diagnóstico da arquitetura atual

O que existe e funciona hoje:
- **Uma única página** (`/`) com o apresentador e um painel de teste ao lado.
- **Cena única**: imagem do estúdio como fundo fixo, personagem em camadas (tronco, cabeça, mesa na frente).
- **Animações**: respiração, piscadas automáticas e manuais, aceno, inclinação de cabeça, expressões feliz/surpresa, efeitos de curtida/seguidor/presente.
- **Painel de teste** em português, só com acionamento manual, todos os eventos marcados como "teste".
- **Estrutura pronta para Live2D**: o desenho do personagem é trocável sem mexer no painel.

O que não existe: banco de dados, backend, login, voz, música, fila de eventos, várias cenas, rota para OBS, integração com TikTok.

## O que será entregue nesta etapa

1. **Módulos independentes** (cada um com responsabilidade única, sem depender da tela):
   - Gerenciador de cenas — lista de cenas, cena ativa, transição suave. Começa só com a cena "Estúdio" (a atual); novas cenas entram como configuração, sem cenas inventadas com arte falsa.
   - Gerenciador de eventos + Fila — recebe eventos, valida, ordena por prioridade (lendário > especial > seguidor > comum > comentário > curtidas), ignora duplicados e limita frequência.
   - Motor do apresentador — transforma eventos em gestos/expressões e em pedidos de fala; fila de falas com pausar, retomar e interromper.
   - Motor de voz — só a estrutura e a interface nesta etapa (sem voz real ainda; ver "Próximas etapas").
   - Motor de música — estrutura com volume por trilha, volume geral, silêncio, loop, troca suave por cena e abaixar volume quando o apresentador fala. Sem trilhas ainda (nenhuma música comercial).
   - Investigação (dossiês) — só a interface, vazia.
   - Adaptador de integração — interface para um provedor futuro do TikTok LIVE: estados conectado/desconectado/reconectando/erro, registro de eventos, validação e origem obrigatória em cada evento. Nenhum endereço ou credencial inventado; nenhum provedor real conectado.

2. **Modo de demonstração** claramente identificado (selo visível "DEMONSTRAÇÃO" no painel e nos alertas), com botões para: comentário (texto digitado por você), curtidas em marcos configuráveis, novo seguidor, presente comum, especial e lendário. Todo evento de demonstração leva a origem "demo" e nunca é mostrado como evento do TikTok.

3. **Painel de controle** (página `/`, adaptando o atual): cenas, eventos de teste, reação configurável por tipo de presente, fila de eventos ao vivo, fila de falas com pausar/interromper, volumes (estrutura), liga/desliga do modo demonstração. As animações manuais atuais continuam lá.

4. **Saída para OBS** — nova página `/broadcast`, limpa (só cenário, personagem, animações e alertas), com formatos horizontal 1920×1080 e vertical 1080×1920 escolhidos pelo endereço. O painel e a saída conversam entre abas do mesmo navegador; animações usam relógio próprio para não parar quando a janela está escondida.

5. **Testes básicos** para fila (prioridade, duplicados, limite de frequência), validação de eventos, origem demo obrigatória e as rotas `/` e `/broadcast`.

## Próximas etapas (não nesta)
- Voz real em português (precisa ativar o backend e escolher um serviço de voz; a chave fica protegida no servidor).
- Trilhas originais por cena (você fornece ou geramos depois).
- Provedor real de eventos do TikTok LIVE.
- Ligação painel ↔ OBS entre computadores diferentes (precisa backend).

## Detalhes técnicos
- `src/lib/engine/` com `scenes.ts`, `events.ts` (tipos + validação), `event-queue.ts`, `presenter-engine.ts`, `speech-engine.ts` (interface `SpeechProvider`, implementação nula), `music-engine.ts` (Web Audio, grupos de ganho separados voz/música), `investigation.ts`, `integration-adapter.ts` (interface `LiveEventProvider` + `DemoProvider`), `bus.ts` (BroadcastChannel entre painel e `/broadcast`).
- `usePresenter` e `SpriteRig` reaproveitados; `Reaction.source` passa a `"demo" | "live"`.
- Rota `src/routes/broadcast.tsx` com `?format=landscape|portrait`, sem painel.
- Testes em `src/test/` com vitest.
- Registrar a decisão de módulos em `AGENTS.md`.
