# 🚀 Guide de déploiement — MedScan AI

## Structure du projet

```
medscan-ai/
├── netlify/
│   └── functions/
│       └── claude.js       ← Fonction serverless (votre backend)
├── public/
│   └── index.html          ← L'application (votre frontend)
├── netlify.toml            ← Configuration Netlify
├── package.json
└── DEPLOIEMENT.md          ← Ce fichier
```

---

## Étape 1 — Créer un compte Netlify

1. Allez sur **netlify.com** → "Sign up" (gratuit)
2. Connectez-vous avec GitHub, GitLab ou email

---

## Étape 2 — Obtenir votre clé API Anthropic

1. Allez sur **console.anthropic.com**
2. Créez un compte si besoin
3. Allez dans **"API Keys"** → "Create Key"
4. Copiez la clé (commence par `sk-ant-...`)
5. **Ne partagez jamais cette clé** — elle reste uniquement sur Netlify

> 💡 **Coût estimé** : environ 0,003 $ par scan (très peu cher).
> Avec 1 000 utilisateurs faisant 3 scans/jour = ~9 $/mois.

---

## Étape 3 — Déployer sur Netlify (méthode drag & drop, la plus simple)

### Option A — Sans code (recommandé pour tester)

1. Allez sur **app.netlify.com**
2. Cliquez **"Add new site" → "Deploy manually"**
3. **Glissez-déposez le dossier entier** `medscan-ai/` dans la zone de dépôt
4. Netlify vous donne une URL du type `https://amazing-name-123.netlify.app`

### Option B — Via GitHub (recommandé pour la suite)

```bash
# 1. Initialisez un dépôt Git
cd medscan-ai/
git init
git add .
git commit -m "Premier déploiement MedScan AI"

# 2. Poussez sur GitHub
# Créez un repo sur github.com, puis :
git remote add origin https://github.com/VOTRE_NOM/medscan-ai.git
git push -u origin main

# 3. Sur Netlify : "Import from Git" → sélectionnez votre repo
# Build command : (laisser vide)
# Publish directory : public
```

---

## Étape 4 — Configurer la clé API (OBLIGATOIRE)

Sans cette étape, l'application ne fonctionne pas.

1. Dans Netlify, allez dans votre site
2. **Site configuration → Environment variables**
3. Cliquez **"Add a variable"**
4. Ajoutez :
   - **Key** : `ANTHROPIC_API_KEY`
   - **Value** : `sk-ant-votre-clé-ici`
5. Cliquez **"Save"**
6. **Redéployez** le site (bouton "Trigger deploy")

### (Optionnel) Restreindre aux appels de votre domaine

Ajoutez une deuxième variable :
- **Key** : `ALLOWED_ORIGIN`
- **Value** : `https://votre-site.netlify.app`

---

## Étape 5 — Tester

1. Ouvrez votre URL Netlify
2. Tapez "Doliprane" dans le scanner
3. Vous devriez voir l'analyse s'afficher en quelques secondes ✅

---

## Étape 6 — Domaine personnalisé (optionnel)

Pour avoir `www.medscan.fr` au lieu de `amazing-name-123.netlify.app` :

1. Achetez un domaine sur **OVH, Namecheap ou Gandi** (~10€/an)
2. Dans Netlify : **Domain management → Add custom domain**
3. Suivez les instructions pour configurer les DNS
4. Le HTTPS est automatique (Let's Encrypt, gratuit)

---

## Surveillance et logs

- **Netlify Dashboard → Functions** : voir chaque appel à la fonction
- **Logs en temps réel** : `netlify functions:invoke claude --no-identity` (en local)
- **Erreurs** : visibles dans l'onglet "Functions" de votre site Netlify

---

## Développement local

```bash
# Installer les dépendances
npm install

# Créer un fichier .env local
echo "ANTHROPIC_API_KEY=sk-ant-votre-clé" > .env

# Lancer en local (simule Netlify)
npm run dev
# → Ouvrez http://localhost:8888
```

---

## Limites du plan gratuit Netlify

| Ressource | Gratuit | Pro (19$/mois) |
|-----------|---------|----------------|
| Sites | Illimité | Illimité |
| Bande passante | 100 GB/mois | 1 TB/mois |
| Exécutions fonctions | 125 000/mois | 2 millions/mois |
| Durée max fonction | 10 secondes | 26 secondes |

> Pour 1 000 utilisateurs/jour avec 3 scans chacun = ~90 000 appels/mois.
> Le plan gratuit tient jusqu'à ~1 400 utilisateurs actifs/jour.

---

## En cas de problème

**L'app ne répond pas :**
→ Vérifiez que `ANTHROPIC_API_KEY` est bien configurée dans Netlify

**Erreur "502 Bad Gateway" :**
→ La clé API est peut-être incorrecte ou expirée

**Erreur CORS :**
→ Vérifiez que `netlify.toml` est bien présent à la racine du projet

**Support** : docs.netlify.com | console.anthropic.com/docs
