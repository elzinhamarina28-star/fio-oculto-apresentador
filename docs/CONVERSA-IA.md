# Camada conversacional — primeira etapa

Branch: `feat/ia-interativa-live`

## O que foi preparado
- Estratégia determinística em português para comentários, presentes, novos seguidores e curtidas.
- Personalidades: misterioso, bem-humorado e acolhedor.
- Controles por tipo de evento, chave geral e intervalo mínimo entre falas.
- Comandos compatíveis com o contrato atual do apresentador.
- Nenhum histórico de espectadores é persistido.

## Limites explícitos
- Esta etapa não é um modelo de IA generativa: as respostas são templates contextuais locais.
- A origem `demo` continua sendo demonstração. Não existe conexão real com TikTok LIVE nesta etapa.
- Para IA generativa, será necessário um endpoint no servidor e uma chave de provedor guardada em segredo; nunca colocar chave no navegador.
- Para eventos reais do TikTok, será necessário um provedor/integração compatível, executado no servidor, com credenciais e validação próprias.

## Proteções
- Cooldown configurável para reduzir sobreposição.
- Respostas curtas, limpeza de caracteres de controle e limite de texto recebido.
- Interações gratuitas por comentários continuam habilitadas; não há metas, ranking ou incentivo a gastar/enviar presentes.

## Preservação
Nenhum arquivo em `src/assets/audio`, nenhum player, manifesto ou controle musical foi alterado.
