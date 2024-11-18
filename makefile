help:
	@awk -F ':|##' '/^[^\t].+:.*##/ { printf "\033[36mmake %-28s\033[0m -%s\n", $$1, $$NF }' $(MAKEFILE_LIST) | sort

PHONY: build-image
build-image: .build-image	## build image

PHONE: compose-run
compose-run: ## bring docker compose up
	docker compose -f system-compose-dev.yml up

PHONY: run-manager
run-manager: .build-session-manager-dev ## run manager container
	cd session-manager && \
	docker run --rm --name manager-dev \
		-p 8080:8080 \
		-p 9229:9229 \
		-v .:/app manager-dev \
		node --inspect=0.0.0.0:9229 --nolazy ./.dist/session-manager.js

PHONY: run-session
run-session: .build-session-dev ## run instance of session (debug port 9230)
	cd session && \
	docker run --rm --name session-dev \
		-p 9230:9229 \
		-v .:/app session-dev \
		node --inspect=0.0.0.0:9229 --nolazy ./.dist/session/session.js session-id=10 port=10010

PHONY: npm-install
npm-install: ## npm install
	cd session && npm install
	cd session-manager && npm install


.build-session-dev:
	cd session && \
	tsc && \
	docker build -f dockerfile-dev -t session-dev .
.build-session-run:
	cd session && \
	tsc && \
	docker build -f dockerfile-run -t session-run .

.build-session-manager-dev:
	cd session-manager && \
	npm run build && \
	docker build -f dockerfile-dev -t manager-dev . 

.build-image: .build-session-dev .build-session-run .build-session-manager-dev