_python_pkg = tessellation
db_name = tessellation
db_user = tessellation
tmp_secret_key_file = /tmp/tessellation-secret-key

.PHONY: run frontend run-prod run-wsgi check-prod start-postgresql setup setup-dev manage shell migrate makemigrations create-db create-superuser populate-db cleanup-media build-frontend test lint-backend lint-frontend lint tox reformat help

run: | start-postgresql  ## Start the development server
	pipenv run python manage.py runserver

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

setup:  ## Create Pipenv virtual environment and install Python and frontend dependencies.
	pipenv --three --site-packages
	pipenv install
	cd frontend && yarn install

setup-dev:  ## Install development dependencies
	pipenv install --dev

manage:  ## Run Django's manage.py, use variable 'args' to pass arguments
	pipenv run python manage.py $(args)

shell:  ## Run Django Extensions Shell Plus
	$(MAKE) manage args=shell_plus

migrate:  ## Migrate
	$(MAKE) manage args=migrate

makemigrations:  ## Make migrations
	$(MAKE) manage args=makemigrations

create-db:  ## Create database
	sudo -u postgres sh -c ' \
	    createuser --createdb "$(db_user)"; \
	    createdb --encoding=UTF8 --template=template0 -O "$(db_user)" "$(db_name)"'

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

test: | start-postgresql  ## Run unit tests
	$(MAKE) manage args="test"

lint-backend:  ## Run Python linting
	pipenv run flake8 $(_python_pkg)
	pipenv run mypy $(_python_pkg) --ignore-missing-imports
	pipenv run isort -c -rc $(_python_pkg)

lint-frontend: ## Run JavaScript
	cd frontend && yarn lint

lint: | lint-backend lint-frontend  ## Run all linting

tox:  ## Test with tox
	tox -r

reformat:  ## Reformat Python code using Black
	black -l 79 --skip-string-normalization $(_python_pkg)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'
