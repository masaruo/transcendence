all:
	make -C ./frontend
	make -C ./backend

clean:
	make clean -C ./frontend
	make clean -C ./backend

dev: clean
	make dev -C ./frontend
	make dev -C ./backend

re: clean dev

.PHONY: all clean dev re
