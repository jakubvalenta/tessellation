_python_pkg = tessellation
db_name = tessellation
db_user = tessellation
tmp_secret_key_file = /tmp/tessellation-secret-key

.PHONY: run frontend run-prod run-wsgi check-prod start-postgresql setup setup-dev manage shell migrate makemigrations create-db create-superuser populate-db cleanup-media build-frontend test lint-backend lint-frontend lint tox reformat help

run: | start-postgresql  ## Start the development server
	poetry run python manage.py runserver

frontend: frontend/public/supportedBrowsers.js  ## Start the frontend development server
	cd frontend && yarn serve

run-prod: $(tmp_secret_key_file) | start-postgresql  ## Start the development server with production settings
	DJANGO_SETTINGS_MODULE=conf.settings_prod \
	SECRET_KEY_FILE="$(tmp_secret_key_file)" \
	$(MAKE) manage args="runserver"

run-wsgi: $(tmp_secret_key_file)  ## Collect static files and start the production WSGI server
	$(MAKE) manage args="collectstatic --no-input"
	SECRET_KEY_FILE="$(tmp_secret_key_file)" \
	gunicorn conf.wsgi

check-prod: $(tmp_secret_key_file)  ## Check production settings
	DJANGO_SETTINGS_MODULE=conf.settings_prod_ssl \
	SECRET_KEY_FILE="$(tmp_secret_key_file)" \
	$(MAKE) manage args="check --deploy"

$(tmp_secret_key_file):
	pwgen --secure --symbols 64 1 > $@

start-postgresql:
	[[ -e /run/postgresql/.s.PGSQL.5432 ]] || systemctl start postgresql.service

setup:  ## Create virtual environment and install Python and frontend dependencies.
	poetry install
	cd frontend && yarn install

manage:  ## Run Django's manage.py, use variable 'args' to pass arguments
	poetry run python manage.py $(args)

shell:  ## Run Django shell
	$(MAKE) manage args=shell

migrate:  ## Migrate
	$(MAKE) manage args=migrate

makemigrations:  ## Make migrations
	$(MAKE) manage args=makemigrations

create-user:  ## Create database user
	sudo -u postgres createuser --createdb "$(db_user)"

create-db:  ## Create database
	sudo -u postgres createdb --encoding=UTF8 --template=template0 -O "$(db_user)" "$(db_name)"

create-superuser:  ## Create superuser
	$(MAKE) manage args="createsuperuser --username=admin --email=example@example.com"

populate-db:  ## Populate database with fixtures
	$(MAKE) manage args="populate_db"

cleanup-media:  ## Remove unused media files
	$(MAKE) manage args="cleanup_unused_media --no-input"

frontend/public/supportedBrowsers.js:
	cd frontend && yarn supportedBrowsers

build-frontend: frontend/public/supportedBrowsers.js  ## Build frontend files with Webpack for production
	cd frontend && yarn build

test-backend: | start-postgresql  ## Run Python unit tests
	DJANGO_SETTINGS_MODULE=conf.settings_test \
	$(MAKE) manage args="test $(args)"

test-backend-with-coverage: | start-postgresql  ## Run Python unit tests with code coverage reporting
	DJANGO_SETTINGS_MODULE=conf.settings_test \
	poetry run coverage run --source='.' manage.py test $(args)
	poetry run coverage html -d results/coverage

test-frontend:  ## Run frontend unit tests
	cd frontend && yarn test:unit

test: | test-backend test-frontend  ## Run all unit tests

lint-backend:  ## Run Python linting
	poetry run flake8 $(_python_pkg)
	poetry run mypy $(_python_pkg) --ignore-missing-imports
	poetry run isort -c $(_python_pkg)

lint-frontend: ## Run JavaScript
	cd frontend && yarn lint

lint: | lint-backend lint-frontend  ## Run all linting

tox:  ## Test with tox
	tox -r

reformat:  ## Reformat Python code using Black
	black -l 79 --skip-string-normalization $(_python_pkg)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'
