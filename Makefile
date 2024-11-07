_python_pkg = tessellation
db_name = tessellation
db_user = tessellation
tmp_secret_key_file = /tmp/tessellation-secret-key

.PHONY: run
run: | start-postgresql  ## Start the development server
	poetry run python manage.py runserver

.PHONY: frontend
frontend: frontend/public/supportedBrowsers.js  ## Start the frontend development server
	cd frontend && yarn serve

.PHONY: run-prod
run-prod: $(tmp_secret_key_file) | start-postgresql  ## Start the development server with production settings
	DJANGO_SETTINGS_MODULE=conf.settings_prod \
	SECRET_KEY_FILE="$(tmp_secret_key_file)" \
	$(MAKE) manage args="runserver"

.PHONY: run-asgi
run-asgi: $(tmp_secret_key_file)  ## Collect static files and start the production ASGI server
	$(MAKE) manage args="collectstatic --no-input"
	SECRET_KEY_FILE="$(tmp_secret_key_file)" \
	gunicorn -k uvicorn.workers.UvicornWorker conf.asgi

.PHONY: check-prod
check-prod: $(tmp_secret_key_file)  ## Check production settings
	DJANGO_SETTINGS_MODULE=conf.settings_prod_ssl \
	SECRET_KEY_FILE="$(tmp_secret_key_file)" \
	$(MAKE) manage args="check --deploy"

$(tmp_secret_key_file):
	pwgen --secure --symbols 64 1 > $@

.PHONY: start-postgresql
start-postgresql:
	[[ -e /run/postgresql/.s.PGSQL.5432 ]] || systemctl start postgresql.service

.PHONY: setup
setup:  ## Create virtual environment and install Python and frontend dependencies.
	poetry install
	cd frontend && yarn install

.PHONY: manage
manage:  ## Run Django's manage.py, use variable 'args' to pass arguments
	poetry run python manage.py $(args)

.PHONY: shell
shell:  ## Run Django shell
	$(MAKE) manage args=shell

.PHONY: migrate
migrate:  ## Migrate
	$(MAKE) manage args=migrate

.PHONY: makemigrations
makemigrations:  ## Make migrations
	$(MAKE) manage args=makemigrations

.PHONY: create-user
create-user:  ## Create database user
	sudo -u postgres createuser --createdb "$(db_user)"

.PHONY: create-db
create-db:  ## Create database
	sudo -u postgres createdb --encoding=UTF8 --template=template0 -O "$(db_user)" "$(db_name)"

.PHONY: create-superuser
create-superuser:  ## Create superuser
	$(MAKE) manage args="createsuperuser --username=admin --email=example@example.com"

.PHONY: populate-db
populate-db:  ## Populate database with fixtures
	$(MAKE) manage args="populate_db"

.PHONY: cleanup-media
cleanup-media:  ## Remove unused media files
	$(MAKE) manage args="cleanup_unused_media --no-input"

frontend/public/supportedBrowsers.js:
	cd frontend && yarn supportedBrowsers

.PHONY: build-frontend
build-frontend: frontend/public/supportedBrowsers.js  ## Build frontend files with Webpack for production
	cd frontend && yarn build

.PHONY: test-backend
test-backend: | start-postgresql  ## Run Python unit tests
	poetry run pytest tessellation

.PHONY: test-backend-with-coverage
test-backend-with-coverage: | start-postgresql  ## Run Python unit tests with code coverage reporting
	DJANGO_SETTINGS_MODULE=conf.settings_test \
	poetry run coverage run --source='.' manage.py test $(args)
	poetry run coverage html -d results/coverage

.PHONY: test-frontend
test-frontend:  ## Run frontend unit tests
	cd frontend && yarn test:unit

.PHONY: test
test: | test-backend test-frontend  ## Run all unit tests

.PHONY: lint-backend
lint-backend:  ## Lint Python code
	poetry run ruff check $(_python_pkg)
	poetry run mypy $(_python_pkg)

.PHONY: lint-frontend
lint-frontend: ## Lint JavaScript code
	cd frontend && yarn lint

.PHONY: lint
lint: | lint-backend lint-frontend  ## Lint all code

.PHONY: tox
tox:  ## Test Python code with tox
	tox -r

.PHONY: format
format:  ## Format Python code
	poetry run ruff format $(_python_pkg)

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'
