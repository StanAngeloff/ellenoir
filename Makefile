# The directory/basename of the Node.js server certificate files.
SERVER_CERT_FILE    := app/certificates/server

SERVER_CERT_COUNTRY := UK
SERVER_CERT_COUNTY  := Oxfordshire
SERVER_CERT_CITY    := Oxford

# Check if a given command is available and exit if it's missing.
required-dependency =                                         \
	echo -n "Checking if '$(1)' is available... " ;             \
	$(eval COMMAND := which '$(1)')                             \
	if $(COMMAND) >/dev/null; then                              \
		$(COMMAND) ;                                              \
	else                                                        \
		echo "command failed:" ;                                  \
		echo ;                                                    \
		echo "    $$ $(COMMAND)" ;                                \
		echo ;                                                    \
		echo "You must install $(2) before you could continue." ; \
		echo ;                                                    \
		exit 1;                                                   \
	fi

# Extract dependencies from a "package.json" file.
extract-dependencies =                                               \
	$(eval BEFORE_CLOSING := 'N;/}/{P;q};P;D')                         \
	$(shell ( \
		cat '$(1)' | sed -e '1,/dependencies/d'    | sed -n $(BEFORE_CLOSING) ; \
		cat '$(1)' | sed -e '1,/devDependencies/d' | sed -n $(BEFORE_CLOSING)   \
	)                                  | \
		sed -e 's/^\s\+"//' -e 's/".*//' | \
		sort -u                          | \
		xargs -i echo '$(2)'"{}"'$(3)' )

.PHONY: create-server-certificate install-nodejs-dependencies install-development install start-server default

default: install

# Create the Node.js server certificate files.
create-server-certificate: $(SERVER_CERT_FILE).key $(SERVER_CERT_FILE).crt
$(SERVER_CERT_FILE).key $(SERVER_CERT_FILE).crt:
	@$(call required-dependency,openssl,OpenSSL)
	@read -p 'URL [localhost]: ' CN && [ -n "$$CN" ] || CN='localhost' && \
		openssl req -x509 -nodes                                            \
			-days 3650                                                        \
			-newkey rsa:2048                                                  \
			-keyout '$(SERVER_CERT_FILE).key'                                 \
			-out '$(SERVER_CERT_FILE).crt'                                    \
			-subj "/C=$(SERVER_CERT_COUNTRY)/ST=$(SERVER_CERT_COUNTY)/L=$(SERVER_CERT_CITY)/CN=$$CN" 2>/dev/null
	@echo 'Done, created "$(SERVER_CERT_FILE).{key,crt}".'

NODEJS_DEPENDENCIES := $(call extract-dependencies,'$(CURDIR)/package.json','$(CURDIR)/node_modules/')
install-nodejs-dependencies: $(NODEJS_DEPENDENCIES)
$(NODEJS_DEPENDENCIES):
	@$(call required-dependency,npm,Node.js)
	@npm install

install-development: install-nodejs-dependencies

install: install-development create-server-certificate

NODEJS_SUPERVISOR := $(CURDIR)/node_modules/supervisor/lib/cli-wrapper.js
start-server: $(NODEJS_SUPERVISOR)
$(NODEJS_SUPERVISOR): install-nodejs-dependencies
	@'$@' -q -w '$(CURDIR)/app,$(CURDIR)/bin/ellenoir' -- '$(CURDIR)/bin/ellenoir'


# vim: ts=2 sw=2 noet
