# ATM System - HTTP/HTTPS Development Guide

## Overview

This ATM application supports both HTTP and HTTPS API endpoints, with special configurations for local development environments.

## Development Modes

### Standard Mode (HTTPS)
```bash
npm run dev
```
- Serves the application with HTTPS compatibility
- Suitable for production-like testing
- HTTP API endpoints may be blocked by browser security

### HTTP Development Mode
```bash
./start-http.sh
```
or
```bash
HTTP_MODE=true npm run dev
```
- Enables HTTP API endpoint testing
- Ideal for local development with HTTP APIs
- Bypasses mixed content security restrictions

## API Endpoint Configuration

### HTTPS Endpoints (Production/Remote)
1. Click the settings gear icon
2. HTTPS protocol is automatically enforced for production deployments
3. Enter your API hostname
4. Save configuration

### HTTP Endpoints (Local Development Only)
1. Start the app in HTTP mode using `./start-http.sh`
2. Access via `http://localhost:5000`
3. Click the settings gear icon
4. Select "HTTP (Development)" protocol (only visible on localhost)
5. Enter your API hostname
6. Save configuration

**Note:** HTTP protocol selection is only available when running on developer workstations (localhost, 127.0.0.1, .local domains, or custom ports).

## Environment Detection

The application automatically detects:
- **Localhost**: HTTP endpoints work normally
- **Remote/HTTPS**: HTTP endpoints require HTTP mode access

## Security Considerations

- **HTTPS**: Encrypted, secure connections (recommended for production)
- **HTTP**: Unencrypted connections (development only)
- **Mixed Content**: Browsers block HTTP requests from HTTPS pages

## Troubleshooting

### "Failed to fetch" Error with HTTP
This indicates mixed content security restrictions. Solutions:
1. Use HTTPS for your API endpoint, or
2. Access the app via HTTP using `./start-http.sh`

### Browser Console Debugging
Check the browser console (F12) for detailed error messages and request logging.

## Developer Features

- Real-time API request/response logging
- Visual protocol indicators (secure/insecure)
- URL validation with error feedback
- Mixed content security warnings
- Environment-specific guidance