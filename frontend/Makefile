all:
	npm ci
	npm run build
	cp -r ./dist ../backend/nginx/dist

dev:
	npm install
	npm run build
	cp -r ./dist ../backend/nginx/dist

clean:
	rm -rf dist
	rm -rf ../backend/nginx/dist

re: clean all dev

.PHONY: all clean
