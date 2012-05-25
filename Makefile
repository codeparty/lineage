test:
	./node_modules/.bin/mocha $(TESTS)

TESTS := $(shell find test/ -name '*.js')

.PHONY: all test clean
