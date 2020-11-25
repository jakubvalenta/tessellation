# Tessellation

A web app to arrange tiles according to specified rules.

Tessellation allows you to upload square images and define how they connect. The
app will then try to arrange the tiles into a larger composition adhering to the
connection rules. This is similar to the [Wang tiles
problem](https://en.wikipedia.org/wiki/Wang_tile).

![Tessellation screenshot](./tessellation/static/img/tessellation-create.png)

## Installation

### Mac

``` shell
$ brew install python yarn
$ pip install pipenv
$ make setup
```

### Arch Linux

``` shell
# pacman -S pipenv yarn
$ make setup
```

### Other systems

Install these dependencies manually:

- Python >= 3.7
- yarn
- pipenv

Then run:

``` shell
$ make setup
```

## Usage

Start a development server

``` shell
$ make run
$ make frontend
```

Create database:

``` shell
$ make create-db
```

Create database tables, superuser, and populate the db with fixtures:

``` shell
$ make migrate create-superuser populate-db
```

Start a development server with production settings.

Dependencies:

- pwgen

``` shell
$ make run-prod
```

## Development

### Installation

``` shell
make setup-dev
```

### Testing and linting

``` shell
make test
make lint
```

### Help

``` shell
make help
```

## Contributing

__Feel free to remix this project__ under the terms of the GNU General Public
License version 3 or later. See [COPYING](./COPYING) and [NOTICE](./NOTICE).
