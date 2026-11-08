# Fio Oculto — Apresentador híbrido com rig esquelético real

## Auditoria: estado confirmado

- O projeto existente abre no navegador sem erro de execução observado. Os **33 testes atuais passaram**.
- O apresentador atual é composto por imagens de cabeça e tronco, animadas por CSS. **Não existem malha 3D, esqueleto, skinning, blend shapes ou Animation Mixer.** Essa solução não atende ao novo pedido.
- Estúdio, mesa e gato também são imagens. Uma câmera 3D sobre esse fundo não permitirá, sozinha, caminhar atrás de objetos, puxar uma cadeira ou fazer contato físico convincente.
- Já existem painel administrativo, fila cinematográfica com prioridades, cinco variações de dança visual, três níveis de curtidas, efeitos, associações de presentes, adaptador TikFinity, voz ElevenLabs e 47 músicas. Esses recursos serão reutilizados, não duplicados.
- A boca atual acompanha o volume do áudio: isso **não é sincronização por fonemas**.
- **A página limpa `/broadcast` ainda não existe.** O canal de comunicação entre abas é apenas uma base não conectada à interface. Não afirmar que OBS já recebe comandos ou áudio.
- A existência do adaptador não comprova recebimento real de eventos TikTok. Voz paga, captura real e funcionamento no OBS não foram testados nesta auditoria.
- Não há GLB/GLTF nos materiais enviados. Há duas imagens e o pacote de MP3.
- Os remotos locais apontam à infraestrutura Lovable; esta auditoria não comprova a sincronização externa com `elzinhamarina28-star/fio-oculto-apresentador`. Nenhuma publicação será feita.

## Escolha resolvida

Usar **modelo gratuito compatível**, com aparência adaptada ao Fio Oculto. A arte original permanecerá preservada como opção legada, sem ser apresentada como personagem articulado.

**Limite importante:** a pesquisa encontrou candidatos gratuitos, mas ainda não confirmou um arquivo que reúna mãos articuladas, expressões faciais, roupa adequada e todas as animações. Não substituir esses requisitos por um boneco genérico incompatível. A seleção exige inspecionar o arquivo real e confirmar a licença que permite servi-lo no aplicativo.

## 1. Validar o personagem e os recursos 3D

- Inspecionar candidatos gratuitos e registrar licença, ossos, hierarquia, pesos, malhas, materiais, expressões e animações efetivamente presentes.
- Exigir coluna, quadril, pescoço, cabeça, braços, cotovelos, pulsos, mãos, coxas, joelhos, tornozelos e pés, com malha deformada pelo esqueleto.
- Confirmar clips de caminhada, corrida, sentar, levantar, dança e gestos; adaptar animações compatíveis quando necessário, com correção de contatos e transições.
- Confirmar expressões e abertura da boca por blend shapes, além do controle da mandíbula e olhos. Não anunciar esses recursos quando ausentes.
- Validar também um gato articulado e objetos 3D adequados para mesa e cadeira.
- **Critério de passagem:** arquivos reais disponíveis e inspecionados, direitos confirmados e demonstração básica do rig. Se nenhum modelo gratuito atender, apresentar os requisitos ausentes antes de integrar um substituto inadequado.

## 2. Novo desenho sem reconstruir o aplicativo

- Introduzir um novo renderizador 3D com React Three Fiber e Three.js, conectado ao contrato atual do apresentador.
- Manter o renderizador original separado; não apagar imagens nem permitir que seu CSS anime o corpo 3D.
- Recriar a área física do estúdio em 3D com identidade Fio Oculto, mesa, cadeira e pontos de contato coerentes. Preservar a arte original e os elementos de transmissão existentes.
- Reutilizar controles, voz, música, filas e eventos existentes. Não criar um segundo responsável por fala ou encerramento das reações.
- Separar esqueleto, expressões, efeitos e gato: efeitos mágicos nunca deformarão o corpo para simular articulação.

## 3. Movimento corporal e entrada

- Estados: repouso em pé, caminhar, correr, aproximar da cadeira, mover cadeira, sentar, repouso sentado, levantar, gesticular e reagir.
- Misturar animações corporalmente compatíveis, sem saltos bruscos e sem alterar proporções.
- Entrada pré-visualizável: cenário → caminhada → aproximação → contato com cadeira → cadeira deslocada → sentar → postura → olhar para câmera.
- Respiração, piscadas, olhar, pequenos gestos e variação de postura contínuos; mãos e pés devem respeitar os pontos de contato.
- Apontar, cruzar braços, comemorar, vergonha, surpresa, indignação e interação com objetos/gato por ossos e poses reais.
- Não gerar fala paga ao carregar a página ou simplesmente ao montar o personagem; início falado depende do comando explícito existente.

## 4. Voz, eventos e gato

- Conectar o áudio existente à mandíbula e aos blend shapes. Identificar claramente a primeira sincronização por amplitude; sincronização por fonemas só será anunciada se houver dados temporais compatíveis da voz.
- Preservar ElevenLabs, credenciais no servidor, configurações, interrupção e fila sem sobreposição.
- Conectar a mesma fila cinematográfica às animações: cinco danças de seguidor, três níveis de vergonha e reações de presentes.
- Reutilizar associações de IDs fornecidos pelo operador/TikFinity; nunca inventar IDs ou eventos reais.
- Gato articulado com caminhar, sentar e observar, subir/interagir, deslocar papéis e interromper o apresentador; perspectiva, apoios e escala coerentes.
- Preservar os sons e todas as 47 músicas, sem modificar seu catálogo ou funcionamento.

## 5. Personalização e transmissão

- Ampliar o painel existente com modelo, entrada, repouso, clips de reação, expressões e pré-visualizações individuais. Mostrar apenas opções realmente disponíveis no modelo.
- Reutilizar os controles existentes de efeito, intensidade, duração, som e fala.
- Criar `/broadcast` limpa, horizontal e vertical, sem controles administrativos.
- Testar a comunicação no contexto real de uso. **OBS usa um navegador separado:** BroadcastChannel não é garantia de comunicação com a aba administrativa. Não prometer controle entre OBS e navegador sem transporte apropriado; uma ligação entre contextos/computadores será tratada separadamente se necessária.

## 6. Critérios de aceite e testes

- Validar no arquivo: esqueleto, skinning, blend shapes e clips. Validar no navegador: renderização sem tela vazia e sem erro de carregamento.
- Demonstrar caminhada e corrida com alternância real de pernas/braços; sentar e levantar com flexão de quadril/joelhos e contatos corretos.
- Demonstrar entrada completa, cinco danças, três níveis de vergonha, expressões e retorno ao repouso.
- Verificar separadamente fogo, raio, gelo, explosão, gravidade e portal, sem deformar a malha para substituir movimento corporal.
- Testar gato, voz acionada manualmente, interrupção, eventos demonstrativos identificados e preservação das músicas.
- Acrescentar testes das regras de estados, transições e fila junto aos existentes; executar os testes e conferir os resultados automáticos de compilação/TypeScript. Não declarar uma animação concluída apenas por existir um botão.
- Capturar verificações desktop e mobile; conferir formato horizontal/vertical. Fluidez em GPU real, som e captura final OBS exigem teste no computador de transmissão e serão identificados como não verificados aqui.

## Componentes a modificar — detalhes técnicos

| Área | Arquivos previstos |
|---|---|
| Dependências 3D | `package.json`, arquivo de lock |
| Modelo, gato, móveis e licenças | Novos ponteiros em `src/assets/models/` e registro de licenças |
| Renderização | Novo `SkeletalRig.tsx` e módulos de cena 3D em `src/components/presenter/`; preservar `SpriteRig.tsx` como legado |
| Contrato e estados | `src/lib/presenter/types.ts`, `use-presenter.ts`, novos módulos de estados/clips e respectivos testes |
| Personalização e efeitos | `CinematicPanel.tsx`, `CinematicEffects.tsx`, `cinematic.ts`, `use-cinematic.ts`, apenas onde necessário para conectar animações reais |
| Páginas | `src/routes/index.tsx`, nova `src/routes/broadcast.tsx`, metadados próprios e montagem 3D somente no navegador |
| Estilos | `src/styles.css`, isolando estilos legados e posicionando controles/saída |
| Validação e documentação | Testes existentes/novos, `AGENTS.md`, `roadmap.md` |

Não reescrever o painel de IA, serviço ElevenLabs, arquivos MP3 ou motor de música para realizar a troca visual. Qualquer alteração de voz necessária à sincronização avançada será limitada à integração comprovada e manterá as configurações existentes.

## Entrega por etapas

1. Modelo e rig validados, com movimento corporal básico demonstrado.
2. Estúdio físico, entrada, corpo, expressões e gato integrados.
3. Eventos, efeitos, personalização e saída limpa conectados.
4. Evidências de teste e lista explícita das dependências externas restantes.

Este plano não declara o personagem 3D implementado. A auditoria e os testes atuais foram concluídos; a implementação começa pela validação de um modelo gratuito realmente compatível.