#!/usr/bin/env python3
"""
====================================
MIGRAZIONE FASE 1: Schema + Configurazioni Base
====================================
Migra solo schema, components e configurazioni base.
Questa è la fase più SICURA - nessun codice custom, solo strutture dati.

COSA MIGRA:
- Content-types schema (src/api/*/content-types/*/schema.json)
- Components (src/components/**/*.json)
- Configurazioni base (config/server.ts, middlewares.ts, api.ts)

COSA NON MIGRA:
- Controllers, services, routes custom
- Lifecycles globali (src/index.ts)
- Plugin custom (tree-view)
- Admin customizations
- .env (da configurare manualmente)

RISCHIO: BASSO ✅
TEMPO TEST: 1-2 ore

USO:
    python migrazione_fase1.py --target "C:\\path\\to\\progetto\\docker"

Autore: Generato automaticamente
Data: 2025-11-05
====================================
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# Colori per output
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    GRAY = '\033[90m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

if sys.platform == 'win32':
    try:
        import colorama
        colorama.init()
    except ImportError:
        Colors.CYAN = Colors.GREEN = Colors.YELLOW = ''
        Colors.RED = Colors.GRAY = Colors.WHITE = Colors.RESET = Colors.BOLD = ''


def print_header(text: str, color=Colors.CYAN):
    print(f"{color}{'=' * 60}{Colors.RESET}")
    print(f"{color}  {text}{Colors.RESET}")
    print(f"{color}{'=' * 60}{Colors.RESET}")
    print()


def print_step(step: str, total: int, current: int, text: str):
    print(f"{Colors.CYAN}[{current}/{total}] {text}...{Colors.RESET}")


def print_success(text: str, indent: str = '   '):
    print(f"{indent}{Colors.GREEN}✓ {text}{Colors.RESET}")


def print_error(text: str, indent: str = '   '):
    print(f"{indent}{Colors.RED}✗ {text}{Colors.RESET}")


def print_warning(text: str, indent: str = '   '):
    print(f"{indent}{Colors.YELLOW}⚠ {text}{Colors.RESET}")


def print_info(text: str, indent: str = '   '):
    print(f"{indent}{Colors.WHITE}ℹ {text}{Colors.RESET}")


def print_detail(text: str, indent: str = '        '):
    print(f"{indent}{Colors.GRAY}• {text}{Colors.RESET}")


def validate_paths(target_path: str) -> Tuple[Path, Path]:
    """Valida i percorsi sorgente e target"""
    print_step('Validazione percorsi', 5, 1, 'Validazione percorsi')
    
    source_path = Path.cwd()
    
    # Verifica package.json sorgente
    source_package = source_path / 'package.json'
    if not source_package.exists():
        print_error('File package.json non trovato nella directory corrente')
        print_info('Esegui questo script dalla ROOT del progetto Strapi sorgente')
        sys.exit(1)
    
    # Verifica che sia un progetto Strapi
    with open(source_package, 'r', encoding='utf-8') as f:
        pkg_data = json.load(f)
        if '@strapi/strapi' not in pkg_data.get('dependencies', {}):
            print_error('La directory corrente non sembra essere un progetto Strapi')
            sys.exit(1)
    
    print_success(f'Progetto sorgente valido: {source_path.name}')
    print()
    
    # Verifica target
    target = Path(target_path).resolve()
    target_package = target / 'package.json'
    
    if not target_package.exists():
        print_error(f'File package.json non trovato in: {target}')
        sys.exit(1)
    
    with open(target_package, 'r', encoding='utf-8') as f:
        pkg_data = json.load(f)
        if '@strapi/strapi' not in pkg_data.get('dependencies', {}):
            print_error('Il progetto target non sembra essere un progetto Strapi')
            sys.exit(1)
    
    print_success(f'Progetto target valido: {target.name}')
    print()
    
    return source_path, target


def copy_file(source: Path, target: Path, description: str) -> Tuple[int, bool]:
    """Copia un singolo file"""
    try:
        if not source.exists():
            print_warning(f'{description} non trovato - skip')
            return 0, False
        
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        print_success(f'{description}')
        return 1, True
        
    except Exception as e:
        print_error(f'{description}: {e}')
        return 0, False


def migrate_content_type_schemas(source: Path, target: Path) -> int:
    """Migra SOLO gli schema.json di tutte le collection"""
    print_step('Migrazione content-types schema', 5, 2, 'Migrazione schema content-types')
    
    migrated = 0
    source_api = source / 'src' / 'api'
    target_api = target / 'src' / 'api'
    
    if not source_api.exists():
        print_warning('Cartella src/api/ non trovata')
        return 0
    
    api_folders = [f for f in source_api.iterdir() if f.is_dir()]
    
    for api_folder in api_folders:
        content_types_folder = api_folder / 'content-types'
        
        if not content_types_folder.exists():
            continue
        
        # Per ogni content-type, copia SOLO schema.json
        for ct_folder in content_types_folder.iterdir():
            if not ct_folder.is_dir():
                continue
            
            schema_file = ct_folder / 'schema.json'
            if schema_file.exists():
                target_schema = target_api / api_folder.name / 'content-types' / ct_folder.name / 'schema.json'
                files, success = copy_file(schema_file, target_schema, f'Schema {api_folder.name}/{ct_folder.name}')
                migrated += files
    
    print()
    print_success(f'{migrated} schema migrati')
    print()
    return migrated


def copy_directory(source: Path, target: Path, description: str) -> Tuple[int, bool]:
    """Copia ricorsivamente una directory"""
    try:
        if not source.exists():
            print_warning(f'{description} non trovato - skip')
            return 0, False
        
        target.parent.mkdir(parents=True, exist_ok=True)
        
        if target.exists():
            shutil.rmtree(target)
        
        shutil.copytree(source, target)
        file_count = sum(1 for _ in target.rglob('*') if _.is_file())
        
        print_success(f'{description} ({file_count} files)')
        return file_count, True
        
    except Exception as e:
        print_error(f'{description}: {e}')
        return 0, False


def migrate_components(source: Path, target: Path) -> int:
    """Migra tutti i components"""
    print_step('Migrazione components', 5, 3, 'Migrazione components')
    
    files, success = copy_directory(
        source / 'src' / 'components',
        target / 'src' / 'components',
        'Components'
    )
    
    if success:
        print_detail('url/url-addizionali')
        print_detail('shared/seo')
        print_detail('Altri components custom')
    
    print()
    return files


def migrate_base_configs(source: Path, target: Path) -> int:
    """Migra solo configurazioni base (NO admin.ts, NO plugins.ts)"""
    print_step('Migrazione configurazioni base', 5, 4, 'Migrazione configurazioni base')
    
    migrated = 0
    
    config_files = [
        ('server.ts', 'config/server.ts'),
        ('middlewares.ts', 'config/middlewares.ts'),
        ('api.ts', 'config/api.ts'),
    ]
    
    for filename, description in config_files:
        files, success = copy_file(
            source / 'config' / filename,
            target / 'config' / filename,
            description
        )
        migrated += files
    
    print()
    print_info('NON migrati (configurare manualmente):')
    print_detail('config/admin.ts (preview mode, security)')
    print_detail('config/plugins.ts (GCS upload)')
    print_detail('config/database.ts (PostgreSQL vs SQLite)')
    print_detail('.env (variabili d\'ambiente)')
    print()
    
    return migrated


def main():
    parser = argparse.ArgumentParser(
        description='FASE 1: Migra schema e configurazioni base (SICURO)'
    )
    parser.add_argument(
        '--target',
        type=str,
        required=True,
        help='Percorso al progetto Strapi target (es: C:\\progetti\\strapi-docker)'
    )
    
    args = parser.parse_args()
    
    print()
    print_header('🔷 MIGRAZIONE FASE 1: SCHEMA + CONFIGURAZIONI BASE', Colors.CYAN)
    print_info('Rischio: BASSO ✅')
    print_info('Tempo test stimato: 1-2 ore')
    print()
    
    # Validazione
    source_path, target_path = validate_paths(args.target)
    
    # Contatori
    total_files = 0
    
    # Migrazione
    total_files += migrate_content_type_schemas(source_path, target_path)
    total_files += migrate_components(source_path, target_path)
    total_files += migrate_base_configs(source_path, target_path)
    
    # Riepilogo
    print_header('📊 RIEPILOGO FASE 1', Colors.GREEN)
    print_success(f'Files migrati: {total_files}')
    print()
    
    print_header('✅ PROSSIMI PASSI', Colors.YELLOW)
    print_detail('1. Riavvia Strapi nel container Docker')
    print_detail('2. Verifica che tutti i content-types appaiano nell\'admin')
    print_detail('3. Verifica che i components siano disponibili')
    print_detail('4. Testa la creazione di contenuti con i nuovi schema')
    print()
    print_detail('Se tutto OK → Procedi con FASE 2 (Services + Controllers)')
    print()


if __name__ == '__main__':
    main()
