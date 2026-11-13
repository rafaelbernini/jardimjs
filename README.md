# Jardim do JavaScript — Vercel + SQLite remoto

Jogo educativo original com **24 fases**, execução de JavaScript no navegador (Web Worker), cadastro de estudantes, persistência de progresso e tentativas em **SQLite/libSQL**, painel protegido do professor, relatórios individuais (JSON, HTML e impressão em PDF) e CSV da turma.

## Publicar na Vercel (passo a passo)

1. Extraia o ZIP e coloque o conteúdo da pasta `JARDIMJS_COMPLETO_VERCEL` em um repositório Git ou importe diretamente no seu projeto Vercel.
2. Crie um banco **Turso/libSQL** (SQLite remoto), por exemplo via [Marketplace da Vercel](https://vercel.com/marketplace/tursocloud/database). Copie a URL libSQL e o token de acesso.
3. Em **Vercel → Project → Settings → Environment Variables** cadastre:
   - `TURSO_DATABASE_URL` = `libsql://...`
   - `TURSO_AUTH_TOKEN` = token do banco (se requerido)
   - `ADMIN_PASSWORD` = senha longa exclusiva do professor
   - `SESSION_SECRET` = chave aleatória longa (`openssl rand -hex 32`)
   - `APP_ORIGIN` = opcional, URL exata do site (ex.: `https://meu-site.vercel.app`). Recomenda-se definir.
4. Escolha framework **Other**; diretório raiz contendo `package.json` e `vercel.json`; comando de instalação `npm install`; nenhum build necessário. Faça o deploy.
5. Abra `/api/health` (verifica que o endpoint está ativo); abra o domínio do projeto para a atividade; abra `/professor` para o painel administrativo.
6. Faça um teste completo: cadastrar aluno fictício, resolver fase, recarregar a página, verificar o mesmo progresso e conferir o registro no painel professor.

**Importante:** a Vercel não oferece armazenamento persistente para o SQLite em arquivo local. Usar `file:./dados/jardimjs.db` na Vercel perderia dados. A aplicação bloqueia essa configuração em ambiente Vercel; use Turso remoto. O schema é criado automaticamente na primeira chamada à API.

## Teste no computador (SQLite em arquivo)

Requer **Node.js 22+** e npm (modo SQLite local utiliza `node:sqlite`). Execute:

```bash
npm install
cp .env.example .env
# Edite .env: remova TURSO_DATABASE_URL e TURSO_AUTH_TOKEN,
# ajuste ADMIN_PASSWORD, SESSION_SECRET; deixe LOCAL_DATABASE_URL=file:./dados/jardimjs.db
npm run dev
```

Abra `http://localhost:3000` (jogo) e `http://localhost:3000/professor`. O arquivo de dados fica em `dados/jardimjs.db`. Nunca publique `.env`, dados ou tokens no Git.

## Entrega e avaliação

- O estudante informa **nome, turma e número de chamada**. O banco gera sessão aleatória, cujo token fica salvo no navegador do aluno.
- Cada tentativa envia código, movimentos, erro/acerto e data. O estado completo sincroniza com o banco após um pequeno intervalo. O navegador também possui cópia local para continuidade.
- O aluno pode baixar **JSON do servidor**, **JSON local**, **HTML** e salvar **PDF** via botão de impressão. Ao completar 24 fases, pode finalizar a entrega, bloqueando posteriores alterações no banco.
- O professor entra em `/professor`, consulta alunos por turma/nome, vê códigos, tentativas, progresso e tempos, e exporta CSV.
- **Sem garantia antifraude:** execução e métricas são computadas no navegador e podem ser adulteradas por um usuário tecnicamente capacitado. O servidor comprova o recebimento de eventos, não que os movimentos foram auditados; avalie também o código. Não use tempo como controle de presença.
- Se o aluno apagar armazenamento do navegador ou trocar de dispositivo, perderá o token de sessão; o professor ainda terá os registros no banco. O administrador poderá exportar os dados para arquivamento.

## Privacidade / LGPD

Recolhe somente identificação escolar estritamente necessária, códigos, métricas e horários. **Não solicite CPF**, data de nascimento ou outros dados sensíveis. Informe à escola e aos alunos sobre finalidade, duração da retenção, acesso administrativo e direito de acesso/retificação conforme política institucional. Turso hospeda dados de estudantes: verifique região de armazenamento, contrato, controle de acesso e demais requisitos da escola. O banco não vem com remoção automática nem com uma política institucional definida. O painel do professor oferece exclusão manual definitiva de cadastros e seus registros, mediante confirmação. Proteja a senha do professor e os tokens no ambiente.

## Estrutura

```text
public/index.html                página do jogo
public/estilos.css               estilos
public/niveis.js                 24 fases
public/jogo.js                   motor e relatórios
public/cloud.js                  sincronização com a API
public/professor/                painel administrativo
api/index.js                     funções HTTP serverless
server/db.js                     conexão, tabelas e índices SQLite
scripts/dev.mjs                  servidor local de teste
vercel.json                      rotas e configuração de implantação
.env.example                     exemplo de variáveis
```

## Correção e notas no painel

No painel `/professor`, clique em **Ver fases**. O sistema apresenta os códigos, o histórico e um formulário de **nota de 0 a 100 (uma casa decimal) e observações até 2.000 caracteres**. A avaliação é gravada na tabela SQLite `assessments` e incluída na exportação CSV da turma. A avaliação é registrada manualmente pelo professor, não calculada automaticamente pelo tempo ou pelo número de tentativas.

## Endpoints

`GET /api/health`; `POST /api/student/register`; `GET/PUT /api/student/progress`; `POST /api/student/attempt`; `POST /api/student/finalize`; `GET /api/student/receipt`; `POST /api/teacher/login`; `POST /api/teacher/logout`; `GET /api/teacher/students`; `GET /api/teacher/student/:id`; `POST /api/teacher/student/:id/assessment`; `GET /api/teacher/csv`; `DELETE /api/teacher/student/:id`.

## Limitações e melhorias antes de uso institucional em larga escala

- Login docente atualmente depende de senha única e cookie assinado (8h). Para múltiplos professores, implemente contas e autenticação institucional.
- Não há rate limiting distribuído/anti-bot de cadastro nem limpeza automática de dados; aconselha-se proteção de borda, quotas e política de retenção antes de abrir o jogo publicamente.
- Cada novo cadastro gera um registro; para evitar múltiplos cadastros por aluno, distribuir identificadores via escola ou integrar com login institucional.
- A API não executa JavaScript do aluno por segurança. Registros de conclusão são **declarados pelo cliente**, não verificados por execução segura no backend.

## Testes e limites da validação

- Rode `npm run check` para validar a sintaxe, o catálogo das 24 fases e o fluxo de API em SQLite local (incluindo registro da avaliação docente).
- As 24 fases possuem soluções de referência verificadas na simulação de navegador e relatório de exemplo.
- A versão gráfica foi inspecionada em tamanhos de computador e celular; os arquivos em `previas/` são demonstrações com nomes fictícios.
- **A implantação real na Vercel/Turso ainda depende das credenciais e da conta de hospedagem da escola.** É obrigatório testar `/api/health`, cadastro, sincronização, nota e exportação depois do deploy.

## Operação e segurança

- Use uma senha forte para `ADMIN_PASSWORD` e gere `SESSION_SECRET` com pelo menos 32 bytes imprevisíveis.
- O código dos alunos é executado em `Web Worker` interrompido após limite de tempo; ele não é executado no servidor. Trata-se de ambiente didático e não de isolamento robusto para JavaScript hostil.
- Não compartilhe arquivos `.env`, credenciais do Turso, tokens do aluno ou relatórios com dados pessoais fora do ambiente escolar.
- O mecanismo de recebimento de progresso é declaratório: as métricas não são uma prova imutável de autoria ou presença.
- Não se deve publicar o painel aberto sem testar senha, cookie e origem HTTPS. A escola deve definir tempo de retenção, quem pode acessar e como realizar backup.
