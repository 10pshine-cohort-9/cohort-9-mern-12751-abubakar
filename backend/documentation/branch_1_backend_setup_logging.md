# Branch 1: Backend Setup and Logging

## Overview
This branch focuses on establishing the backend foundation for the Notes App, with an emphasis on application structure, logging, and basic request handling.

## What was implemented
- Set up the Express backend application structure.
- Added a centralized logger using Pino for structured application logging.
- Configured pretty logging output for non-production environments.
- Integrated request logging middleware to capture incoming HTTP requests.
- Implemented a health check endpoint at /api/health.
- Added error handling for unknown routes and unexpected application errors.
- Added startup validation to ensure required environment variables such as MONGO_URI and PORT are present and valid.
- Added basic test coverage for the health endpoint and server behavior.

## Notes
- This branch establishes the initial backend infrastructure needed for future feature development.
