# Manual do professor | JardimJS 4.1

## Antes de divulgar o link

1. Configure Turso e Vercel como descrito no README. O banco local não deve ser usado no deploy.
2. Configure `ADMIN_PASSWORD` e `SESSION_SECRET` somente nas variáveis do projeto.
3. Abra `/api/health`, cadastre um aluno fictício, conclua uma fase e confira no painel `/professor`.
4. Envie aos estudantes o link do jogo, o prazo e o PDF de enunciado anexado.
5. Combine com a turma que o aluno deve usar o mesmo navegador e não apagar os dados do site.

## Como avaliar

Acesse `/professor` e informe a senha configurada na Vercel.

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

1. comprovante JSON baixado do **servidor**;
2. relatório imprimível salvo em PDF.

A entrega definitiva bloqueia novas alterações dessa sessão, mas continua disponível para consulta. Antes de excluir um cadastro, arquive os registros necessários seguindo a política da instituição.

## Atenção à privacidade

Solicite apenas nome, turma e número de chamada. Informe a finalidade do tratamento, os responsáveis, prazo de retenção e canal de contato da instituição. Não solicite CPF. Faça cópias de segurança, proteja o acesso do professor e escolha a região do banco conforme os requisitos da escola.
