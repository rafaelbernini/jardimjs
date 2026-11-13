# Publicar JardimJS estático na Vercel

1. Atualize o repositório com esta versão.
2. No projeto da Vercel, use framework **Other**, raiz do repositório e saída **public**. Não é necessário comando de instalação ou build; vercel.json contém a configuração.
3. Faça um novo deploy. Não são necessárias variáveis TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, ADMIN_PASSWORD ou SESSION_SECRET.
4. Abra o jogo, identifique um aluno de teste e resolva a primeira fase. A segunda deve ficar disponível; as demais continuam bloqueadas.
5. Atualize a página e confira a recuperação do código e progresso.
6. Baixe a entrega completa JSON. Abra /professor, importe o arquivo, confira detalhes e registre uma nota.
7. Exporte o CSV e uma cópia de segurança JSON da turma. Esta cópia pode ser reimportada em outro navegador.

O site não usa /api/health nem qualquer endpoint de cadastro. Os dados não ficam na Vercel: ficam no armazenamento local de cada navegador e domínio. Finalizar não envia a entrega ao professor; o aluno deve baixar o JSON e enviá-lo pelo portal escolar.

Se ainda aparecer a mensagem antiga sobre Turso, confira se o domínio está apontando para a nova implantação e recarregue a página para carregar os arquivos atuais.
