_python_pkg = tiles
db_name = tiles
db_user = tiles

.PHONY: run setup setup-dev manage create-db test lint tox reformat help

run:  ## Start the development
	pipenv run python manage.py runserver

setup:  ## Create Pipenv virtual environment and install dependencies.
	pipenv --three --site-packages
	pipenv install

setup-dev:  ## Install development dependencies
	pipenv install --dev

manage:  ## Run Django's manage.py, use variable 'args' to pass arguments
	pipenv run python manage.py $(args)

create-db:
	sudo -u postgres sh -c ' \
	    createuser "$(db_user)" && \
	    createdb --encoding=UTF8 --template=template0 -O "$(db_user)" "$(db_name)"'

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
