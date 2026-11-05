# Fio Oculto — Continuação da LIVE interativa

Este documento registra a próxima etapa sem declarar integrações ainda inexistentes como prontas.

## Estado confirmado no código
- O apresentador atual usa sprites em camadas e CSS; a arte do cenário e a mesa continuam separadas do personagem.
- Existem Event Manager, validação, fila com prioridades/deduplicação/rate limit, DemoProvider, Presenter Engine, SpeechQueue, MusicEngine, Scene Manager e BroadcastChannel.
- O adaptador define o contrato de um provedor, mas nenhum provedor real do TikTok LIVE está conectado.
- O endpoint TTS da ElevenLabs está preparado no servidor, mas ainda não está ligado à reprodução do personagem.
- CaptionOnlyProvider continua sendo somente legenda temporizada, não gera áudio.
- O catálogo das dez instrumentais foi registrado em `docs/creative-pack/trilhas-instrumentais.json`, preservando os prompts recebidos e a ordem 11–20. Os MP3 ainda precisam ser publicados no repositório e associados aos IDs das faixas antes de declarar a reprodução integrada.

## Decisões confirmadas (04/11/2026)
- Plataforma de transmissão: OBS Studio.
- Voz: ElevenLabs, com chamadas somente pelo servidor e credenciais em secrets/variáveis de ambiente.
- TikTok LIVE: usar um conector compatível já existente, isolado atrás de `LiveEventProvider`. O repositório ainda contém somente o contrato genérico; nenhum conector real está configurado ou identificado. Não declarar conexão real até escolher/validar o pacote e realizar um teste de LIVE.
- Saída OBS: rota `/broadcast`, sem painel, sincronizada com o painel no mesmo navegador/perfil via BroadcastChannel.
- O painel é a origem dos comandos; a rota OBS apenas recebe, evitando eco de mensagens.

## Ordem de implementação

### A. MVP visual e saída OBS
1. [ ] Ligar DemoProvider, EventQueue e Presenter Engine ao painel atual.
2. [x] Criar /broadcast sem controles, em formato horizontal 16:9.
3. [x] Sincronizar painel e /broadcast via BroadcastChannel no mesmo navegador/perfil.
4. [x] Adicionar testes para validação de eventos, prioridade, duplicação, rate limit e gateway de voz.
5. [x] Configurar CI para testes, lint e build em push e pull request. Testes e build executam; lint ainda aponta problemas de formatação herdados do projeto.
6. [ ] Conectar a fila de eventos ao painel e à saída visual OBS.

### B. Voz natural
1. [x] Definir ElevenLabs como provedor TTS.
2. [x] Criar proxy server-side `POST /api/speech` com streaming MP3, validação de origem, token de operador e limite de 600 caracteres.
3. [x] Adicionar testes de validação sem consumir créditos da API.
4. [x] Documentar secrets e configuração local em `docs/CONFIGURAR-VOZ-ELEVENLABS.md`.
5. [ ] Configurar `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` e `FIO_OPERATOR_TOKEN` no ambiente de deploy.
6. [ ] Conectar a resposta de áudio ao SpeechProvider/SpeechQueue e à saída OBS.
7. [ ] Testar áudio real em português, interrupção, fila, falha de rede e ducking da música.
8. [ ] Não anunciar voz real até o teste de áudio concluído.

### C. Gatinho como personagem secundário
- Verificar a arte original: se o gato estiver incorporado no fundo, solicitar/produzir recorte transparente do gato; não tentar apagar o gato com CSS.
- Criar componente CatRig independente do cenário e do apresentador.
- Estados iniciais: idle/dormir, andar, pular/subir na mesa, cutucar, interação cômica com o apresentador e derrubar uma pista como overlay/prop separado.
- Movimentos por timeline/estados com cooldown e prioridade; não bloquear alertas de eventos gratuitos.
- Precisará de sprites/poses em PNG/WebP transparente ou rig (ex. Live2D/Rive); não inventar animação completa a partir de uma única imagem.

### D. Música para lives longas
1. [x] Registrar o catálogo das dez instrumentais com prompts, BPM e ordem oficial.
2. [ ] Adicionar os arquivos finais de áudio ao repositório e vinculá-los aos IDs das faixas.
3. [ ] Cadastrar as faixas no MusicEngine e associar cada uma às cenas correspondentes.
4. [ ] Implementar/validar crossfade, loop e ducking durante fala.
5. [ ] Testar reprodução contínua e retomada após troca de cena.
- As trilhas devem ser originais ou licenciadas para transmissão; evitar músicas comerciais sem licença.

### E. TikTok LIVE real
- Escolher e validar um provedor compatível e permitido para eventos de LIVE.
- Conectar no backend, validar payloads e origem, tratar reconexão, rate limits e logs.
- Nunca inserir cookies, tokens ou credenciais no navegador/repositório.
- Só marcar conexão como real depois de um teste controlado com eventos gratuitos (comentários, marcos de curtidas e novos seguidores).

## Limites conhecidos
BroadcastChannel não conecta computadores diferentes nem perfis isolados. Para painel em outro dispositivo, será necessário backend/realtime. OBS Browser Source deve abrir a URL /broadcast no mesmo computador/navegador onde o painel correspondente está aberto, salvo implementação posterior de servidor.
