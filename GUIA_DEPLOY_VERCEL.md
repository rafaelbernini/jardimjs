# Guia rápido: Vercel + Turso

## 1. Preparar o repositório

Envie apenas os arquivos do pacote de implantação: `api/`, `public/`, `server/`, `scripts/`, `tests/`, `package.json`, `vercel.json`, `.env.example` e documentação. Não publique `.env`, `dados/`, `node_modules/` ou dados dos alunos.

## 2. Banco remoto

Crie um banco Turso/libSQL e gere um token privado com acesso ao banco.

## 3. Vercel

Crie um projeto com o repositório, selecione framework **Other**, diretório raiz da aplicação e **sem comando de build**. A Vercel instala dependências `npm install`. Os endpoints estão em `api/index.js` e as páginas/recursos estão em `public/`.

## 4. Environment Variables

```env
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu-token-privado
ADMIN_PASSWORD=sua-senha-forte-unica
SESSION_SECRET=64-caracteres-aleatorios-ou-mais
APP_ORIGIN=https://seu-dominio.vercel.app
```

Para gerar a chave: `openssl rand -hex 32`. Não defina `LOCAL_DATABASE_URL` para a versão em produção. Faça um redeploy após alterar variáveis.

## 5. Testar em produção

1. `/api/health` responde `ok: true` e armazenamento remoto.
2. Cadastro de aluno fictício funciona e volta após atualizar a página.
3. Tentativas e métricas aparecem no painel `/professor`.
4. O professor salva uma nota e uma observação; ambas aparecem no CSV.
5. O aluno conclui e finaliza a entrega, depois obtém o JSON do servidor.
6. O PDF é salvo pelo navegador e o link foi aberto também em dispositivo móvel.
7. Exclua o registro de teste antes de divulgar a atividade.

## Diagnóstico

- `500` em `/api/health`: confira URL/token Turso e logs das funções da Vercel.
- `503` ao entrar como professor: configure `ADMIN_PASSWORD` e `SESSION_SECRET`.
- Progresso não sincroniza: examine conexão, sessão e indicador de salvamento no canto da página.
- Falha de origem: configure `APP_ORIGIN` com domínio HTTPS exato sem barra final.
- No ambiente local, use Node.js 22+, `npm install`, `.env` configurado e `npm run dev`.

**Não há implantação automática neste pacote**: são necessárias as credenciais e uma conta do destinatário na Vercel/Turso.
