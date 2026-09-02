# willfipe

Retorna os dados da tabela FIPE para um determinado veículo.

PWA estática (HTML + CSS + JavaScript puro, sem build, sem Node, sem frameworks) para
consultar preços de carros, motos e caminhões da tabela FIPE. Os dados vêm de um export
em CSV convertido para JSON, servidos como arquivos estáticos — dá pra rodar direto no
GitHub Pages, sem passo de build.

## Estrutura

- `assets/csv/veiculos.csv` — export bruto da FIPE (fonte de verdade dos dados)
- `scripts/convert-csv-to-json.ps1` — script PowerShell que converte o CSV em `data/`
- `data/` — JSON gerado (commitado no repo): `meta.json`, `brands/<TIPO>.json`,
  `models/<TIPO>/<códigoDaMarca>.json`, `search-index.json`
- `index.html`, `css/style.css`, `js/*.js` — a aplicação
- `manifest.json`, `icon.svg`, `sw.js` — parte PWA (instalável, funciona offline)

## Rodando localmente

O app usa `fetch()` para carregar os JSON, então precisa ser servido por HTTP (não
funciona abrindo `index.html` direto como `file://`). Qualquer servidor estático serve:

```
python -m http.server 8000
```

Depois abra `http://localhost:8000/`.

## Atualizando os dados

Sempre que `assets/csv/veiculos.csv` for atualizado, rode de novo (requer Windows
PowerShell, ~30s para as ~51 mil linhas atuais):

```
powershell -File scripts/convert-csv-to-json.ps1
```

Isso regenera tudo em `data/`. Os arquivos gerados devem ser commitados junto — não há
passo de build no deploy.

## Deploy no GitHub Pages

Sem GitHub Actions: em **Settings → Pages**, configure o source como o branch `main`
(pasta raiz). Qualquer push no `main` atualiza o site.
