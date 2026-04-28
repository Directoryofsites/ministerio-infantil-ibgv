@echo off
setlocal

:: --- CONFIGURACION ---
set "SOURCE_DIR=%~dp0"
set "BACKUP_DEST=C:\mcp"
set "WINRAR_PATH=C:\Program Files\WinRAR\WinRAR.exe"

:: Generar nombre con timestamp simple AAAAMMDD_HHMM
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a%%b)
set "BACKUP_NAME=Escuela_IBGV_Backup_%date:~10,4%%date:~4,2%%date:~7,2%.rar"

echo ==================================================
echo   GENERANDO COPIA DE SEGURIDAD (WinRAR)
echo ==================================================
echo Origen: %SOURCE_DIR%
echo Destino: %BACKUP_DEST%\%BACKUP_NAME%
echo.

:: Verificar si WinRAR existe
if not exist "%WINRAR_PATH%" (
    echo [ERROR] No se encontro WinRAR en: %WINRAR_PATH%
    echo Por favor verifica la ruta del ejecutable de WinRAR.
    pause
    exit /b
)

:: Crear destino si no existe
if not exist "%BACKUP_DEST%" mkdir "%BACKUP_DEST%"

:: Ejecutar compresión
:: -r: recurse
:: -ep1: exclude base folder
:: -x: exclude patterns
"%WINRAR_PATH%" a -r -ep1 -x"node_modules\*" -x".next\*" -x"dist\*" -x".git\*" -x".DS_Store" "%BACKUP_DEST%\%BACKUP_NAME%" "%SOURCE_DIR%*"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==================================================
    echo   COPIA COMPLETADA EXITOSAMENTE
    echo   Archivo: %BACKUP_DEST%\%BACKUP_NAME%
    echo ==================================================
) else (
    echo.
    echo [ERROR] Hubo un problema al crear la copia. Codigo: %ERRORLEVEL%
)

pause
