help:
	@awk -F ':|##' '/^[^\t].+:.*##/ { printf "\033[36mmake %-28s\033[0m -%s\n", $$1, $$NF }' $(MAKEFILE_LIST) | sort

PHONY: build-image
build-image: .build-image	## build image

PHONY: run-manager
run-manager: .build-session-manager ## run manager container
	docker run -p 8080:8080 --rm --name manager session-manager

.build-session:
	cd session && \
	tsc && \
	docker build -t session . 

.build-session-manager:
	cd session-manager && \
	npm run build && \
	docker build -t session-manager . 

.build-image: .build-session .build-session-manager