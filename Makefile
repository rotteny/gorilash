PROJECT := gorilash

.DEFAULT_GOAL := help

help: ## Lista todos os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Inicia servidor de desenvolvimento local (porta 8080)
	npx serve . -p 8080

open: ## Abre o site no navegador
	explorer.exe index.html 2>/dev/null || xdg-open index.html

.PHONY: help dev open
