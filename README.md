# JardimJS — versão local no navegador

Jogo educativo com 24 desafios sequenciais, quatro mundos e JavaScript executado em Web Worker. Sem banco remoto, API externa, senha ou credenciais.

## Usar no computador

Execute `npm run dev` e abra http://localhost:3000. O painel fica em http://localhost:3000/professor. Node.js 24 é a versão indicada; não é preciso instalar dependências.

## Publicar na Vercel

Use o repositório existente e faça uma nova implantação. Framework Other, diretório de saída public, sem comandos de instalação ou build. O arquivo vercel.json já configura o site estático. Nenhuma variável Turso é necessária. Veja GUIA_DEPLOY_VERCEL.md.

## Atividade e entrega

O aluno informa nome, turma e chamada. Identificação, código, progresso, tempo e tentativas ficam no localStorage daquele navegador e domínio. Apenas a primeira fase começa liberada; concluir uma fase libera a próxima pelo botão “Próxima fase”. É possível revisar as anteriores.

Em Relatório, baixe o JSON resumido ou a entrega completa (com histórico de tentativas), HTML ou PDF por impressão. Depois das 24 fases, finalize e baixe o arquivo para enviar pelo portal da escola. Finalizar bloqueia a edição local; não envia nada automaticamente.

O professor abre /professor, importa um ou vários arquivos JSON, consulta códigos e métricas, registra nota e observações e exporta CSV. O JSON individual e a cópia de segurança da turma incluem as avaliações. A cópia de segurança pode ser importada novamente, inclusive em outro computador. Reimportar a mesma entrega atualiza os resultados preservando a avaliação existente.

## Armazenamento

Os dados ficam apenas no navegador utilizado. Limpar o armazenamento, trocar de navegador, dispositivo ou domínio não transfere o progresso. Exporte os arquivos antes de sair de computadores compartilhados. O painel não tem autenticação: mostra apenas os arquivos importados naquele navegador. Excluir um registro remove apenas a cópia local do professor.

Os relatórios são gerados pelo aluno, sem verificação de autenticidade. Tempo e tentativas servem para acompanhamento pedagógico, não como prova de presença ou autoria. O JSON resumido contém as métricas por fase; a entrega completa inclui também cada tentativa.

## Validação

Execute `npm run check` para verificar sintaxe e testes de persistência, entrega, importação, avaliação e liberação das fases.

## Quatro mundos extras opcionais (versão 5.1)

Ao concluir o mundo 4, o aluno pode gerar o relatório das 24 fases e escolher se deseja continuar. O convite também fica disponível no relatório enquanto a entrega não estiver finalizada. Aceitar libera os mundos 5 a 8, cada um com um desafio progressivamente mais difícil: Labirinto inteligente, Patrulha em camadas, Rota planejada e Mestre dos jardins.

Os extras trabalham sensores, funções com parâmetros e retorno, laços aninhados, arrays e decisões combinadas. A fase 25 libera a 26, depois a 27 e a 28. A escolha e o progresso persistem após recarregar. Cada mundo extra também mostra os parabéns, tempo ativo e tentativas.

O relatório continua disponível a qualquer momento. Ao habilitar os extras, a finalização passa a exigir 28 fases. Relatórios JSON, HTML/PDF, entrega completa e painel do professor incluem os extras; o painel mantém compatibilidade com as entregas antigas de 24 fases. Os extras não são obrigatórios para quem prefere entregar ao fim do mundo 4.
