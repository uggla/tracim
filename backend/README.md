tracim_backend
==============

This code is "work in progress". Not usable at all for production.

Backend source code of tracim v2, using Pyramid Framework.

Installation
---------------

### Distribution dependencies ###

on Debian Stretch (9) with sudo:

    sudo apt update
    sudo apt install git
    sudo apt install python3 python3-venv python3-dev python3-pip
    sudo apt install redis-server
    sudo apt install zlib1g-dev libjpeg-dev
    sudo apt install imagemagick libmagickwand-dev ghostscript poppler-utils libfile-mimeinfo-perl
    sudo apt install libldap2-dev libsasl2-dev

for better preview support:

    sudo apt install libreoffice # most office documents file and text format
    sudo apt install inkscape # for .svg files.

### Get the source ###

get source from github:

    git clone https://github.com/tracim/tracim.git

go to *backend* subdirectory:

    cd backend

### Setup Python Virtualenv ###

Create a Python virtual environment:

    python3 -m venv env

Activate it in your terminal session (**all tracim command execution must be executed under this virtual environment**):

    source env/bin/activate

Upgrade packaging tools:

    pip install --upgrade pip setuptools

(Optional) Install strict supported version of dependencies with requirement.txt :

    pip install -r requirements.txt

Install the project in editable mode with its testing requirements :

    pip install -e ".[testing]"

If you want to use postgresql, mysql or other databases
than the default one: sqlite, you need to install python driver for those databases
that are supported by sqlalchemy.

For postgreSQL and mySQL, those are shortcuts to install Tracim with test and
specific driver.

For PostgreSQL:

    pip install -e ".[testing,postgresql]"

For mySQL:

    pip install -e ".[testing,mysql]"

### Configure Tracim_backend ###

Create [configuration file](doc/setting.md) for a development environment:

    cp development.ini.sample development.ini

default configuration given is correct for local-test, if you need to run tracim
over network, check [configuration file documentation](doc/setting.md)

Initialize the database using [tracimcli](doc/cli.md) tool

    tracimcli db init

Stamp current version of database to last (useful for migration):

    alembic -c development.ini stamp head

## Run Tracim_backend web services With Uwsgi : great for production ##

if not did before, you need to create a color.json file at root of tracim :
   
    cp ../color.json.sample ../color.json

#### Install Uwsgi

You can either install uwsgi with pip or with you distrib package manager:

    # install uwsgi with pip ( unneeded if you already have uwsgi with python3 plugin enabled)
    sudo pip3 install uwsgi

or on debian 9 :

    # install uwsgi on debian 9
    sudo apt install uwsgi uwsgi-plugin-python3

### All in terminal way ###


Run all web services with uwsgi
    
    ## UWSGI SERVICES
    # set tracim_conf_file path
    export TRACIM_CONF_PATH="$(pwd)/development.ini"
    # pyramid webserver
    uwsgi -d /tmp/tracim_web.log --http-socket :6543 --plugin python3 --wsgi-file wsgi/web.py -H env --pidfile /tmp/tracim_web.pid
    # webdav wsgidav server
    uwsgi -d /tmp/tracim_webdav.log --http-socket :3030 --plugin python3 --wsgi-file wsgi/webdav.py -H env --pidfile /tmp/tracim_webdav.pid
    

to stop them:

    # pyramid webserver
    uwsgi --stop /tmp/tracim_web.pid
    # webdav wsgidav server
    uwsgi --stop /tmp/tracim_webdav.pid

## With Uwsgi ini script file ##

You can also preset uwsgi config for tracim, this way, creating this kind of .ini file:

    # You need to replace <PATH> with correct absolute path
    [uwsgi]
    plugins = python3
    chdir = <PATH>/tracim/backend/
    module = wsgi.web:application
    home = <PATH>/tracim/backend/env/
    env = TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

and :

    # You need to replace <PATH> with correct absolute path
    [uwsgi]
    plugins = python3
    chdir = <PATH>/tracim/backend/
    module = wsgi.webdav:application
    home = <PATH>/tracim/backend/env/
    env = TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

You can then run the process this way :

    # You need to replace <WSGI_CONF_WEB> with correct path
    uwsgi --ini <WSGI_CONF_WEB>.ini --http-socket :6543
    # You need to replace <WSGI_CONF_WEBDAV> with correct path
    uwsgi --ini <WSGI_CONF_WEBDAV>.ini --http-socket :3030

### Run Tracim_Backend with Waitress : legacy way, usefull for debug and dev ###

run tracim_backend web api:

    pserve development.ini

run wsgidav server:

    tracimcli webdav start

## Run daemons according to your config

Feature such as async email notification and email reply system need additional
daemons to work correctly.

### python way

#### Run
    # set tracim_conf_file path
    export TRACIM_CONF_PATH="$(pwd)/development.ini"
    ## DAEMONS SERVICES
    # email notifier (if async email notification is enabled)
    python3 daemons/mail_notifier.py &
    # email fetcher (if email reply is enabled)
    python3 daemons/mail_fetcher.py &

### STOP

    # email notifier
    killall python3 daemons/mail_notifier.py
    # email fetcher
    killall python3 daemons/mail_fetcher.py

### Using Supervisor

#### Install supervisor

    sudo apt install supervisor

#### Configure supervisord.conf file

example of supervisord.conf file

    [supervisord]
    ; You need to replace <PATH> with correct absolute path

    ; email notifier (if async email notification is enabled)
    [program:tracim_mail_notifier]
    directory=<PATH>/tracim/backend/
    command=<PATH>/tracim/backend/env/bin/python <PATH>/tracim/backend/daemons/mail_notifier.py
    stdout_logfile =/tmp/mail_notifier.log
    redirect_stderr=true
    autostart=true
    autorestart=true
    environment=TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

    ; email fetcher (if email reply is enabled)
    [program:tracim_mail_fetcher]
    directory=<PATH>/tracim/backend/
    command=<PATH>/tracim/backend/env/bin/python <PATH>/tracim/backend/daemons/mail_fetcher.py
    stdout_logfile =/tmp/mail_fetcher.log
    redirect_stderr=true
    autostart=true
    autorestart=true
    environment=TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

run with (supervisord.conf should be provided, see [supervisord.conf default_paths](http://supervisord.org/configuration.html):

    supervisord

## Run Tests and others checks ##

### Run Tests ###

Before running some functional test related to email, you need a local working *MailHog*
see here : https://github.com/mailhog/MailHog

You can run it this way with docker :

    docker pull mailhog/mailhog
    docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

You need also a test ldap server on port 3890 for ldap related test.
see here : https://github.com/rroemhild/docker-test-openldap

You can run it this way with docker :

    docker pull rroemhild/test-openldap
    docker run -d -p 3890:389 rroemhild/test-openldap

Run your project's tests:

    pytest

### Lints and others checks ###

Run mypy checks:

    mypy --ignore-missing-imports --disallow-untyped-defs tracim

Run pep8 checks:

    pep8 tracim

Tracim API
----------

Tracim_backend give access to a REST API in */api/v2*.
This API is auto-documented with [Hapic](https://github.com/algoo/hapic).
The specification is accessible when you run Tracim, go to */api/v2/doc* .

For example, with default config:

    # run tracim
    pserve development.ini
    # launch your favorite web-browser
    firefox http://localhost:6543/api/v2/doc/

## Roles, profile and access rights

In Tracim, only some user can access to some informations, this is also true in
Tracim REST API. you can check the [roles documentation](doc/roles.md) to check
what a specific user can do.

# Known issues

see [here](doc/known_issues.md)
