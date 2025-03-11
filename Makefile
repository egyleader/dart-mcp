# Dart MCP Server Makefile

.PHONY: install build test lint clean publish test-coverage

# Default target
all: install build test

# Install dependencies
install:
	npm install

# Build the project
build:
	npm run build

# Run tests
test:
	npm test

# Run tests with coverage
test-coverage:
	npm run test:coverage

# Lint the code
lint:
	tsc --noEmit

# Clean build artifacts
clean:
	rm -rf dist coverage

# Publish to npm
publish: test build
	npm publish

# Install dev dependencies (needed for testing)
dev-deps:
	npm install --save-dev jest ts-jest @types/jest
