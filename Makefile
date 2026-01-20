.PHONY: serve build gh-deploy docker-build docker-build-only docker-serve docker-build-image help clean lint test docker-shell submodules venv

VENV_DIR ?= .venv
PYTHON ?= python3
PIP := $(VENV_DIR)/bin/pip
MKDOCS := $(VENV_DIR)/bin/mkdocs
DOCKER_IMAGE ?= mkdocs-site
DOCKERFILE ?= .devcontainer/Dockerfile
DOCKER_WORKDIR ?= /beans
POSTS_DIR ?=

ifneq ($(strip $(POSTS_DIR)),)
DOCKER_POSTS_VOLUME = -v "$(POSTS_DIR):$(DOCKER_WORKDIR)/docs/blog/posts/comp-2300-winter-26"
else
DOCKER_POSTS_VOLUME =
endif

# Local workflow
venv: $(VENV_DIR)/bin/pip

$(VENV_DIR)/bin/pip: requirements.txt
	$(PYTHON) -m venv $(VENV_DIR)
	$(PIP) install -r requirements.txt

serve: venv
	$(MKDOCS) serve

build: venv
	$(MKDOCS) build

submodules: ## Initialize/update blog submodules listed in scripts/submodules.txt
	./scripts/sync-submodules.sh

gh-deploy: venv
	$(MKDOCS) gh-deploy --force

# Docker workflow
# Use these targets to build and serve the site inside a Docker container.
# - `make docker-serve`: Build the Docker image (if needed) and serve the site at http://localhost:8000
# - `make docker-build`: Build the Docker image only
# - `make docker-build-site`: Build the static site inside Docker
# - `make docker-gh-deploy`: Deploy the site to GitHub Pages using Docker

docker-build docker-build-image: docker-build-only

docker-build-only:
	docker build -t $(DOCKER_IMAGE) -f $(DOCKERFILE) .

docker-serve: docker-build
	docker run --rm -it -p 8000:8000 -v $(PWD):$(DOCKER_WORKDIR) $(DOCKER_POSTS_VOLUME) $(DOCKER_IMAGE) serve -a 0.0.0.0:8000

docker-run:
	docker run --rm -it -v $(PWD):$(DOCKER_WORKDIR) $(DOCKER_POSTS_VOLUME) $(DOCKER_IMAGE)

docker-build-site: docker-build
	docker run --rm -v $(PWD):$(DOCKER_WORKDIR) $(DOCKER_POSTS_VOLUME) $(DOCKER_IMAGE) build

docker-gh-deploy: docker-build
	docker run --rm -v $(PWD):$(DOCKER_WORKDIR) $(DOCKER_POSTS_VOLUME) $(DOCKER_IMAGE) gh-deploy --force

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?##"} {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

clean: ## Remove build artifacts
	rm -rf site __pycache__ .pytest_cache

lint: ## Lint Python and Markdown files
	@echo "Linting Python files..."
	@$(PIP) install --quiet flake8
	@$(VENV_DIR)/bin/flake8 docs/ theme/ || true
	@echo "Linting Markdown files..."
	@which markdownlint || python3 -m pip install --quiet markdownlint-cli
	@markdownlint docs/**/*.md || true

test: ## Run tests (placeholder)
	@echo "No tests defined yet. Add your test commands here."

docker-shell: docker-build ## Open a shell inside the Docker container
	docker run --rm -it -v $(PWD):$(DOCKER_WORKDIR) $(DOCKER_POSTS_VOLUME) $(DOCKER_IMAGE) /bin/sh
