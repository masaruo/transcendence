# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands
- Frontend: `npm run dev` - Dev server with Vite
- Frontend: `npm run build` - Production build (TypeScript + Vite)
- Backend: `python backend/app/manage.py runserver` - Run Django server
- Docker: `docker-compose up` - Run both frontend and backend

## Test Commands
- Backend: `python backend/app/manage.py test` - Run all tests
- Single Test: `python backend/app/manage.py test user.tests.test_user_api.PublicUserApiTests.test_create_user_success`
- Lint: `flake8 backend/app` - Check Python code with flake8

## Code Style
- Python: Follow PEP8, use Django REST Framework patterns 
- TypeScript: Strict typing, no unused vars/params, use ES2020 features
- Frontend: Component-based structure, separate HTML/TS/CSS files
- Imports: Group standard libraries, then third-party, then local imports
- Naming: snake_case for Python, camelCase for TypeScript
- Error handling: Use try/except in Python, handle promises properly in TS