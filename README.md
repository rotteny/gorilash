<p align="center">
  <img src="https://raw.githubusercontent.com/rotteny/gorilash/main/img/logo-gorila2.jpg" alt="Gorila Software House" width="200">
</p>

# Gorila Software House — Site Institucional

Site institucional da **Gorila Software House**, empresa de desenvolvimento de software especializada em arquitetura de alto padrão e soluções robustas.

## Sobre o Projeto

Landing page responsiva que apresenta a empresa, seus projetos e canais de contato. O design utiliza um cromatismo técnico com elementos geométricos e poligonais, transmitindo solidez e profissionalismo.

## Tecnologias

- **HTML5** — Estrutura semântica
- **CSS3** — Design system com variáveis, flexbox e grid
- **JavaScript (Vanilla)** — Interações e animações sem dependências externas

## Estrutura de Pastas

O repositório contém apenas o conteúdo do site (raiz = document root):

```
.
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos globais e componentes
├── js/
│   └── main.js         # Lógica de interação
├── img/
│   ├── hero/           # Frames da animação do hero (41 imagens)
│   ├── carousel/       # Imagens do carrossel de projetos
│   │   ├── trackbase.png
│   │   ├── tikbot.png
│   │   ├── acca.png
│   │   └── gtsistema.png
│   └── logo-gorila3.jpg
├── video/              # (legado, não utilizado)
└── README.md
```

**Nginx:** aponte o `root` para a pasta do clone (ex: `/var/www/gorilash`).  
**GitHub Pages:** use "Deploy from a branch" com pasta `/(root)`.

## Funcionalidades

### Hero
- Animação de plano sequencial com 41 frames (substitui vídeo para reduzir peso)
- Delay no último frame antes de reiniciar a sequência

### Carrossel de Projetos
- Loop infinito sem “voltar” visível
- Um projeto por vez em tela
- Navegação por setas, indicadores e rotação automática
- Lightbox ao clicar na imagem para visualização ampliada

### Contato
- Cards para WhatsApp e e-mail
- Links diretos para iniciar conversa

### Institucional
- **Sobre Nós** — Dialog com texto de apresentação da empresa
- **Carreiras** — Dialog com informações para candidatos
- **Contato** — Link para a seção Fale Conosco

## Como Executar

O site é estático e pode ser servido de várias formas:

### Node.js (npx)
```bash
npx serve
```

### Abrir diretamente
Abra o arquivo `index.html` no navegador. Algumas funcionalidades (como o elemento `<dialog>`) podem ter comportamento diferente dependendo do protocolo (file:// vs http://).

## Design System

- **Fontes**: Montserrat (títulos), JetBrains Mono (corpo)
- **Cores**: Azul carvão (#1A242B), cinza aço (#4A5560), branco gelo (#F8FAFC)
- **Estilo**: Bordas poligonais (clip-path), transições suaves

## Contato

- **E-mail**: contato@gorilash.com.br
- **WhatsApp**: (86) 99428-1351
