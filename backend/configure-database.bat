@echo off
echo Configurando DATABASE_URL para producao...

REM Adiciona a DATABASE_URL com configuracoes otimizadas para serverless
vercel env add DATABASE_URL production

echo Configuracao concluida!
echo Fazendo deploy...

vercel --prod

echo Deploy concluido!
pause
