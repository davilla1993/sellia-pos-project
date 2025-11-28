@echo off
REM ================================================
REM Script de test du Rate Limiting - Sellia Backend
REM ================================================
REM Ce script teste le rate limiting sur /api/auth/login
REM Configuration actuelle: 4 tentatives max / 3 minutes
REM ================================================

setlocal enabledelayedexpansion
set BACKEND_URL=http://localhost:8080
set LOGIN_ENDPOINT=%BACKEND_URL%/api/auth/login

echo.
echo ================================================
echo   TEST RATE LIMITING - SELLIA POS
echo ================================================
echo Backend: %BACKEND_URL%
echo Limite: 4 tentatives par 3 minutes
echo ================================================
echo.

echo [1/5] Tentative 1... (devrait passer)
curl -s -X POST %LOGIN_ENDPOINT% ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"wrong\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"
echo.
timeout /t 1 /nobreak >nul

echo [2/5] Tentative 2... (devrait passer)
curl -s -X POST %LOGIN_ENDPOINT% ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"wrong\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"
echo.
timeout /t 1 /nobreak >nul

echo [3/5] Tentative 3... (devrait passer)
curl -s -X POST %LOGIN_ENDPOINT% ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"wrong\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"
echo.
timeout /t 1 /nobreak >nul

echo [4/5] Tentative 4... (devrait passer)
curl -s -X POST %LOGIN_ENDPOINT% ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"wrong\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"
echo.
timeout /t 1 /nobreak >nul

echo [5/5] Tentative 5... (DEVRAIT ETRE BLOQUEE - 429)
curl -s -X POST %LOGIN_ENDPOINT% ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"wrong\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"
echo.

echo ================================================
echo   RESULTAT ATTENDU
echo ================================================
echo Tentatives 1-4: HTTP 401 (Unauthorized - mauvais mot de passe)
echo Tentative 5:    HTTP 429 (Too Many Requests - rate limit)
echo ================================================
echo.
echo Si la tentative 5 montre "429", le rate limiting fonctionne !
echo.
echo Pour retester, attendez 3 minutes ou redemarrez le serveur.
echo ================================================
pause
