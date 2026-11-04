# Fio Oculto — Continuação da LIVE interativa

Este documento registra a próxima etapa sem declarar integrações ainda inexistentes como prontas.

## Estado confirmado no código

- O apresentador atual usa sprites em camadas e CSS; a arte do cenário e a mesa continuam separadas do personagem.
- Existem Event Manager, validação, fila com prioridades/deduplicação/rate limit, DemoProvider, Presenter Engine, SpeechQueue, MusicEngine, Scene Manager e BroadcastChannel.
- O adaptador define o contrato de um provedor, mas nenhum provedor real do TikTok LIVE está conectado.
- CaptionOnlyProvider é somente legenda temporizada, não gera áudio.
- Não há trilhas originais cadastradas nem arte separada do gato confirmada.

## Decisões confirmadas (04/11/2026)

- Plataforma de transmissão: OBS Studio.
- Voz: ElevenLabs, com chamadas somente pelo servidor e credenciais em secrets/variáveis de ambiente.
- TikTok LIVE: usar um conector compatível já existente, isolado atrás de `LiveEventProvider`. O repositório ainda contém somente o contrato genérico; nenhum conector real está configurado ou identificado. Não declarar conexão real até escolher/validar o pacote e realizar um teste de LIVE.
- Saída OBS: rota `/broadcast`, sem painel, sincronizada com o painel no mesmo navegador/perfil via BroadcastChannel.
- O painel é a origem dos comandos; a rota OBS apenas recebe, evitando eco de mensagens.

## Ordem de implementação

### A. Terminar o MVP visual e a saída OBS
1. Ligar DemoProvider, EventQueue e Presenter Engine ao painel atual.
2. Criar /broadcast sem controles, horizontal por padrão e opção vertical.
3. Sincronizar painel e /broadcast via BroadcastChannel no mesmo navegador/perfil.
4. Adicionar testes de eventos, prioridade, duplicação, limites e rotas.
5. Configurar CI (testes, lint e build) em cada push e pull request.

### B. Voz natural
- Manter SpeechProvider como contrato e SpeechQueue como fila.
- Selecionar um serviço TTS com português brasileiro, voz masculina jovem adulta, prosódia natural, controle de velocidade/pausas/estilo e licença adequada.
- Não clonar nem imitar a voz de uma pessoa real.
- Implementar chamadas no servidor; segredos somente em variáveis de ambiente do servidor.
- Tratar interrupção, pausa, retentativa, falha do serviço e ducking da música.
- Não anunciar voz real até existir provedor configurado e teste de áudio concluído.

### C. Gatinho como personagem secundário
- Verificar a arte original: se o gato estiver incorporado no fundo, solicitar/produzir recorte transparente do gato; não tentar apagar o gato com CSS.
- Criar componente CatRig independente do cenário e do apresentador.
- Estados iniciais: idle/dormir, andar, pular/subir na mesa, cutucar, interação cômica com o apresentador e derrubar uma pista como overlay/prop separado.
- Movimentos por timeline/estados com cooldown e prioridade; não bloquear alertas de presentes lendários.
- Precisará de sprites/poses em PNG/WebP transparente ou rig (ex. Live2D/Rive); não inventar animação completa a partir de uma única imagem.

### D. Música para lives longas
Separar dois grupos:
1. Ambiente: trilhas longas ou loops contínuos, baixo volume, crossfade e rotação sem repetição imediata.
2. Eventos: stingers curtos para presentes comuns/especiais/lendários; comentário não dispara música por padrão.

Estimativa para 8–9 horas:
- Se as faixas ambientes tiverem 3–4 minutos e não forem repetidas: 120–180 faixas; se forem loops longos de 10–15 minutos, 32–54 faixas.
- Com 12–16 faixas ambientes em loop/crossfade e variação de ordem, pode haver variedade razoável, mas repetições ocorrerão ao longo de 8–9 horas.
- Começar com 12–16 faixas ambientes originais, de 3–5 minutos, e 4–6 stingers originais curtos (3–12 segundos) para categorias de presentes. A quantidade final depende da duração e tolerância a repetição.
- Todas as faixas devem ser originais ou licenciadas para transmissão; evitar músicas comerciais sem licença.

### E. TikTok LIVE real
- Escolher e validar um provedor compatível e permitido para eventos de LIVE.
- Conectar no backend, validar payloads e origem, tratar reconexão, rate limits e logs.
- Nunca inserir cookies, tokens ou credenciais no navegador/repositório.
- Só marcar conexão como real depois de um teste controlado com eventos reais.

## Limites conhecidos
BroadcastChannel não conecta computadores diferentes nem perfis isolados. Para painel em outro dispositivo, será necessário backend/realtime. OBS Browser Source deve abrir a URL /broadcast no mesmo computador/navegador onde o painel correspondente está aberto, salvo implementação posterior de servidor.
