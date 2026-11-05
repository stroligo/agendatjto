# Agenda Telefônica – TJTO

Site estático (HTML + CSS + JavaScript) com a agenda telefônica do Tribunal de Justiça do Estado do Tocantins. Substitui o antigo `agenda.tjto.jus.br`.

## Estrutura

```
index.html          página única
assets/
  css/style.css     estilos
  js/app.js         leitura do CSV, busca e navegação
  img/              logo, favicon e fundo do cabeçalho (copiados de tjto.jus.br)
csv/
  tribunal.csv      dados do Tribunal (editar aqui para atualizar a agenda)
```

## Como funciona

- `app.js` carrega `csv/tribunal.csv` com `fetch`, interpreta o arquivo (separador `;`, UTF-8 ou Windows-1252) e monta a lista por departamento.
- Busca em tempo real (ignora acentos e maiúsculas), índice A–Z com âncoras, botão "voltar ao topo" e barra de busca fixa.
- A aba **Serventias Extrajudiciais** aponta para o GISE: <https://gise.tjto.jus.br/gise-app/serventiaExtrajudicialPesquisa/contatoCartorios>.
- A aba **Fóruns** ainda não tem dados: o CSV atual só contém unidades do Tribunal (Sede, Anexo I e CGJUS).

## Atualizar os dados

Substitua `csv/tribunal.csv` mantendo o cabeçalho e o separador `;`:

```
Departamento;Sigla;Unidade;Local;Telefone;Fax;Email;Endereco;Horario;Responsavel
```

Não é preciso gerar nada: a página lê o arquivo a cada acesso.

## Executar localmente

O navegador bloqueia `fetch` em `file://`, então use um servidor local:

```bash
python3 -m http.server 5500
# abra http://localhost:5500
```

(ou a extensão Live Server do VS Code)

## Publicação

Publique todo o conteúdo da pasta em qualquer hospedagem estática, mantendo `index.html`, `assets/` e `csv/` juntos. Lembre que `csv/tribunal.csv` fica acessível publicamente pela URL.

## Pendências

- Dados dos Fóruns (`csv/foruns.csv` + ligar à aba).
- Link canônico, `sitemap.xml`, `robots.txt` e imagem de pré-visualização (dependem da URL final).
