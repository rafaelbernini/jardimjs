# Manual do professor | JardimJS 5.0

## Antes de divulgar o link

1. Publique o site estático na Vercel conforme o README. Não é necessário configurar banco ou credenciais.
2. Abra o jogo e identifique um aluno fictício para testar o armazenamento local.
3. Conclua uma fase, baixe o JSON e importe no painel `/professor`.
4. Envie aos estudantes o link do jogo, o prazo e o PDF de enunciado anexado.
5. Combine com a turma que o aluno deve usar o mesmo navegador e não apagar os dados do site.

## Como avaliar

Acesse `/professor` e importe os arquivos JSON enviados pelos alunos. O painel mostra somente as entregas importadas neste navegador, sem login.

- Use filtros de turma e nome para localizar os alunos.
- Na lista, acompanhe fases concluídas, tentativas, erros, dicas, movimentos e tempo ativo.
- Em **Ver fases**, consulte o código de cada etapa e o histórico de execução.
- Lance a nota de 0 a 100 e escreva a devolutiva pedagógica; clique em **Salvar avaliação**.
- Exporte o CSV da turma para o diário de notas. O CSV inclui a nota e observações.
- Use **Exportar JSON individual** para arquivar a trajetória específica de cada estudante.
- Para remover registros pessoais, clique em **Excluir registro** e confirme digitando `EXCLUIR`.

## Critérios sugeridos (100 pontos)

| Critério | Pontos |
|---|---:|
| Fases concluídas | 50 |
| Correção do raciocínio e dos conceitos | 20 |
| Qualidade e legibilidade do código | 15 |
| Evolução, depuração e autonomia | 10 |
| Comprovante e relatório | 5 |

Tempo e número de movimentos são **indicadores descritivos**, nunca a nota automática nem prova de autoria ou presença.

## Planejamento sugerido

Seis aulas de 50 minutos (300 minutos): 1) interface/comandos; 2) sequências/decisões; 3) variáveis e lógica; 4) repetições; 5) funções/arrays; 6) consolidação e entrega. O professor pode ampliar o período para alunos que precisam de mais prática.

## Exportação e recebimento

O aluno conclui as 24 fases, clica em **Finalizar entrega** e entrega no portal escolar:

1. arquivo JSON de entrega baixado do **navegador**;
2. relatório imprimível salvo em PDF.

A entrega definitiva bloqueia novas alterações dessa sessão, mas continua disponível para consulta. Antes de excluir um cadastro, arquive os registros necessários seguindo a política da instituição.

## Atenção à privacidade

Solicite apenas nome, turma e número de chamada. Informe a finalidade do tratamento, os responsáveis, prazo de retenção e canal de contato da instituição. Não solicite CPF. Exporte a cópia de segurança da turma após importar ou avaliar. Os dados ficam somente neste navegador; use um computador de acesso restrito.

## Fluxo local da versão 5

Cada desafio só é liberado após a conclusão dos anteriores. O aluno deve baixar o JSON e enviá-lo pelo portal; finalizar não envia automaticamente. O painel importa JSON resumido, entrega completa e cópias de segurança. Notas são salvas no navegador do professor e incluídas nas exportações. Limpar os dados do navegador apaga os registros locais.
