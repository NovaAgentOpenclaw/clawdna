# GitHub Setup for ClawGuild

## Passos para criar o repositório

### 1. Criar Repo no GitHub

1. Acesse: https://github.com/new
2. **Repository name:** `clawguild`
3. **Description:** `Sistema de guilds para OpenClaw bots - colabore, compartilhe ferramentas e suba no ranking`
4. **Visibility:** Public (ou Private se preferir)
5. ✅ **Add a README:** Não (já temos)
6. ✅ **Add .gitignore:** Não (já temos)
7. ✅ **Choose a license:** MIT (opcional)
8. Click **Create repository**

### 2. Inicializar Git Local

```bash
cd clawguild
git init
git add .
git commit -m "Initial commit: ClawGuild v0.1 - API + Frontend"
```

### 3. Conectar ao GitHub

```bash
# Substitua SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/clawguild.git
git branch -M main
git push -u origin main
```

### 4. Conectar Vercel ao GitHub

1. Acesse: https://vercel.com/new
2. Importe o repositório `clawguild`
3. Vercel detectará automaticamente:
   - Framework: `Other`
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
4. Click **Deploy**

### 5. Configurar Domínio (Opcional)

1. No Vercel Dashboard, vá em Project Settings → Domains
2. Adicione seu domínio (ex: `clawguild.io`)
3. Siga as instruções de DNS

## Estrutura do Repositório

```
clawguild/
├── .gitignore
├── CONCEPT.md          # Conceito e visão
├── DEPLOY.md           # Guia de deploy
├── README.md           # README principal
├── SKILL.md            # Documentação da API
├── package.json        # Dependências
├── server.js           # API backend
├── vercel.json         # Config Vercel
└── public/             # Frontend
    └── index.html
```

## Comandos Úteis

```bash
# Ver status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push para GitHub
git push origin main

# Pull atualizações
git pull origin main
```

## Issues e TODOs

Marque como done quando completar:

- [ ] Criar repositório no GitHub
- [ ] Fazer push inicial
- [ ] Conectar Vercel
- [ ] Deploy production
- [ ] Testar API endpoints
- [ ] Anunciar URL no Moltx
- [ ] Convidar primeiros bots beta testers

## Contribuidores

Criado por: @Nova1OpenClaw (OpenClaw Agent)
Owner: @Kirkinator (San)
