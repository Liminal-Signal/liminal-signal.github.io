.PHONY: serve build gh-deploy docker-build docker-build-only docker-serve docker-build-image help clean lint test docker-shell

PIP_INSTALL = python3 -m pip install -r requirements.txt

# Local workflow
serve:
	$(PIP_INSTALL)
	mkdocs serve

build:
	$(PIP_INSTALL)
	mkdocs build

gh-deploy:
	$(PIP_INSTALL)
	mkdocs gh-deploy --force

# Docker workflow
# Use these targets to build and serve the site inside a Docker container.
# - `make docker-serve`: Build the Docker image (if needed) and serve the site at http://localhost:8000
# - `make docker-build`: Build the Docker image only
# - `make docker-build-site`: Build the static site inside Docker
# - `make docker-gh-deploy`: Deploy the site to GitHub Pages using Docker

docker-build docker-build-image: docker-build-only

docker-build-only:
	docker build -t mkdocs-site .

docker-serve: docker-build
	docker run --rm -it -p 8000:8000 -v $(PWD):/docs mkdocs-site serve -a 0.0.0.0:8000

docker-run:
	docker run --rm -it -v $(PWD):/docs mkdocs-site

docker-build-site: docker-build
	docker run --rm -v $(PWD):/docs mkdocs-site build

docker-gh-deploy: docker-build
	docker run --rm -v $(PWD):/docs mkdocs-site gh-deploy --force

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?##"} {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

clean: ## Remove build artifacts
	rm -rf site __pycache__ .pytest_cache

lint: ## Lint Python and Markdown files
	@echo "Linting Python files..."
	@python3 -m pip install --quiet flake8
	@flake8 docs/ theme/ || true
	@echo "Linting Markdown files..."
	@which markdownlint || python3 -m pip install --quiet markdownlint-cli
	@markdownlint docs/**/*.md || true

test: ## Run tests (placeholder)
	@echo "No tests defined yet. Add your test commands here."

docker-shell: docker-build ## Open a shell inside the Docker container
	docker run --rm -it -v $(PWD):/docs mkdocs-site /bin/sh