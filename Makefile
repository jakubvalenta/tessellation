_python_pkg = tiles
db_name = tiles
db_user = tiles

.PHONY: run setup setup-dev manage shell migrate makemigrations create-db create-superuser populate-db test lint tox reformat help

run:  ## Start the development
	pipenv run python manage.py runserver

setup:  ## Create Pipenv virtual environment and install dependencies.
	pipenv --three --site-packages
	pipenv install

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
	    createuser "$(db_user)"; \
	    createdb --encoding=UTF8 --template=template0 -O "$(db_user)" "$(db_name)"'

create-superuser:  ## Create superuser
	$(MAKE) manage args="createsuperuser --username=root --email=example@example.com"

populate-db:  ## Populate database with fixtures
	$(MAKE) manage args="populate_db"

test:  ## Run unit tests
	pipenv run python -m unittest

lint:  ## Run linting
	pipenv run flake8 $(_python_pkg)
	pipenv run mypy $(_python_pkg) --ignore-missing-imports
	pipenv run isort -c -rc $(_python_pkg)

tox:  ## Test with tox
	tox -r

reformat:  ## Reformat Python code using Black
	black -l 79 --skip-string-normalization $(_python_pkg)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'
