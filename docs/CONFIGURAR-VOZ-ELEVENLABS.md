# Configuração da voz — FIO OCULTO

A aplicação usa um endpoint server-side para encaminhar texto à API de Text-to-Speech da ElevenLabs. A chave da ElevenLabs nunca deve ser colocada no navegador, em arquivos versionados ou em mensagens de chat.

## Secrets/variáveis no ambiente Cloudflare

Configure os seguintes valores no ambiente que publica o Worker:

| Nome | Obrigatório | Descrição |
|---|---:|---|
| `ELEVENLABS_API_KEY` | Sim | Chave da API ElevenLabs |
| `ELEVENLABS_VOICE_ID` | Sim | ID da voz escolhida na conta |
| `FIO_OPERATOR_TOKEN` | Sim | Token privado para autorizar o painel a solicitar áudio |
| `ELEVENLABS_MODEL_ID` | Não | Modelo TTS; padrão `eleven_flash_v2_5` |

Não coloque os valores reais em `.dev.vars.example`, no GitHub, no código do frontend ou em screenshots. Para desenvolvimento local, copie o modelo para `.dev.vars` e preencha os valores apenas na sua máquina. O arquivo `.dev.vars` deve permanecer ignorado pelo Git.

## Endpoint preparado

`POST /api/speech`

Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <FIO_OPERATOR_TOKEN>`

Body:
```json
{ "text": "Olá, investigadores. Temos uma nova pista." }
```

A resposta bem-sucedida é um stream de áudio MP3. O endpoint valida a origem, exige o token do operador, limita o texto a 600 caracteres e não armazena o conteúdo. O áudio é transmitido sem guardar o arquivo inteiro em memória.

## Estado atual

- [x] Proxy server-side com segredo protegido e resposta em streaming.
- [x] Validação de origem, token, JSON, tamanho e texto.
- [x] Testes unitários sem chamar a API externa.
- [ ] Configurar secrets no ambiente Cloudflare.
- [ ] Escolher/configurar o voice ID definitivo.
- [ ] Conectar a resposta de áudio ao mixer/saída do OBS e à SpeechQueue.
- [ ] Testar geração real com a conta e confirmar latência/limites.

A rota não declara voz conectada até os secrets estarem configurados e a reprodução real ser validada.
