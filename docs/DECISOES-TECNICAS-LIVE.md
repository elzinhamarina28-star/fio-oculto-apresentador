# Fio Oculto — decisões técnicas da LIVE

Atualizado em 04/11/2026.

## Decisões confirmadas

| Área | Decisão | Regra de implementação |
|---|---|---|
| Transmissão | OBS Studio | Usar Browser Source apontando para `/broadcast`; começar em 16:9 |
| Voz | ElevenLabs | TTS no servidor; nunca expor API key ou voice ID privado no bundle do navegador |
| Eventos | Integração compatível existente com TikTok LIVE | Implementar/selecionar um provider compatível atrás do contrato `LiveEventProvider`; validar a origem e o formato dos eventos |
| Sincronização | BroadcastChannel | Painel e saída OBS no mesmo navegador/perfil; não funciona entre computadores ou perfis isolados |

## Estado técnico observado

- `src/lib/engine/integration-adapter.ts` já define `LiveEventProvider`, valida eventos, controla status e tentativas de reconexão.
- O único provider concreto presente é `DemoProvider`. Ainda não há dependência nem implementação identificável de um provider real do TikTok LIVE.
- `src/lib/engine/speech-engine.ts` define `SpeechProvider` e `SpeechQueue`; `CaptionOnlyProvider` é apenas legenda temporizada, não áudio.
- `POST /api/speech` encaminha texto à ElevenLabs no servidor e transmite MP3; depende de secrets no ambiente Nitro/Cloudflare e ainda não está ligado à fila/reprodução.
- `/broadcast` é a saída limpa para OBS e recebe comandos do painel por BroadcastChannel.
- A chave da ElevenLabs, o identificador de voz e qualquer credencial do conector TikTok devem ser configurados como secrets/variáveis de ambiente do servidor. Não devem ser commitados.

## Critérios para considerar pronto

### OBS
- Abrir `/broadcast` em Browser Source.
- Confirmar proporção 16:9, transparência/recorte conforme a cena e ausência de painel.
- Acionar comandos no painel e confirmar que o personagem reage na saída OBS.

### ElevenLabs
- [x] Criar endpoint server-side `POST /api/speech` com validação de origem, token de operador e limite de texto.
- [x] Documentar as variáveis de ambiente necessárias.
- Configurar credenciais fora do repositório.
- Ligar o endpoint à implementação de `SpeechProvider` e à saída de áudio do OBS.
- Testar português brasileiro, interrupção, fila, falha de rede e redução automática do volume da música.
- Só então substituir a indicação visual de “somente legenda” por “voz conectada”.

### TikTok LIVE
- Confirmar nome, versão, manutenção e compatibilidade do conector escolhido com a plataforma/ambiente de execução.
- Executar conexão no servidor, reconexão e validação de payloads.
- Testar primeiro com eventos gratuitos (comentários, marcos de curtidas e novos seguidores).
- Não armazenar cookies, tokens ou dados pessoais dos espectadores nos logs.

## Próximo bloqueio de integração

O código não identifica qual conector compatível existente será usado para o TikTok LIVE. A interface do provider está pronta para receber essa implementação, mas a escolha do conector precisa ser validada antes de escrever código específico ou declarar conexão real. A voz já tem um endpoint seguro, porém falta configurar os secrets e ligar a reprodução ao apresentador.
