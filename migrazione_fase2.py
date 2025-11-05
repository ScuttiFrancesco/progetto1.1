#!/usr/bin/env python3
"""
====================================
MIGRAZIONE FASE 2: Services + Controllers + Lifecycles
====================================
Migra il CORE delle funzionalità custom: services, controllers, routes e lifecycles globali.
Questa fase introduce il codice business logic personalizzato.

PREREQUISITI:
✅ FASE 1 completata e testata con successo

COSA MIGRA:
- Services custom (path-resolver, default-path)
- Controllers custom (archivio, unpublish, path-resolver, pagina)
- Routes custom (tutte le API custom)
- Global lifecycles (src/index.ts - PathResolver, AutoSlug, SEO, DefaultPath)
- Utils (src/utils/seo-auto-populate.ts)

COSA NON MIGRA:
- Plugin custom (tree-view) → FASE 3
- Admin customizations → FASE 3
- config/admin.ts, config/plugins.ts → FASE 3
- .env (da configurare manualmente)

RISCHIO: MEDIO ⚠️
TEMPO TEST: 2-4 ore

USO:
    python migrazione_fase2.py --target "C:\\path\\to\\progetto\\docker"

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
    print_step('Validazione percorsi', 8, 1, 'Validazione percorsi')
    
    source_path = Path.cwd()
    
    source_package = source_path / 'package.json'
    if not source_package.exists():
        print_error('File package.json non trovato nella directory corrente')
        sys.exit(1)
    
    with open(source_package, 'r', encoding='utf-8') as f:
        pkg_data = json.load(f)
        if '@strapi/strapi' not in pkg_data.get('dependencies', {}):
            print_error('La directory corrente non sembra essere un progetto Strapi')
            sys.exit(1)
    
    print_success(f'Progetto sorgente: {source_path.name}')
    
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
    
    print_success(f'Progetto target: {target.name}')
    print()
    
    return source_path, target


def copy_file(source: Path, target: Path, description: str, create_backup: bool = True) -> Tuple[int, bool]:
    """Copia un singolo file"""
    try:
        if not source.exists():
            print_warning(f'{description} non trovato - skip')
            return 0, False
        
        if create_backup and target.exists():
            backup_path = Path(str(target) + '.backup')
            shutil.copy2(target, backup_path)
            print_info(f'Backup: {backup_path.name}')
        
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        print_success(f'{description}')
        return 1, True
        
    except Exception as e:
        print_error(f'{description}: {e}')
        return 0, False


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


def migrate_api_common(source: Path, target: Path) -> int:
    """Migra API Common (services, controllers, routes)"""
    print_step('Migrazione API Common', 8, 2, 'Migrazione API Common')
    
    files, success = copy_directory(
        source / 'src' / 'api' / 'common',
        target / 'src' / 'api' / 'common',
        'API Common'
    )
    
    if success:
        print_detail('path-resolver service (cache O(1))')
        print_detail('default-path service (path gerarchici)')
        print_detail('archivio controller (anno/mese/giorno)')
        print_detail('unpublish controller (universale)')
        print_detail('path-resolver controller + routes')
    
    print()
    return files


def migrate_collection_controllers_services_routes(source: Path, target: Path) -> int:
    """Migra controllers, services e routes di TUTTE le collection"""
    print_step('Migrazione controllers/services/routes', 8, 3, 'Migrazione controllers/services/routes')
    
    migrated = 0
    source_api = source / 'src' / 'api'
    target_api = target / 'src' / 'api'
    
    if not source_api.exists():
        print_warning('Cartella src/api/ non trovata')
        return 0
    
    api_folders = [f for f in source_api.iterdir() if f.is_dir() and f.name != 'common']
    
    print_info(f'Trovate {len(api_folders)} collection da migrare')
    print()
    
    for api_folder in api_folders:
        collection_name = api_folder.name
        
        # Controllers
        controllers_folder = api_folder / 'controllers'
        if controllers_folder.exists():
            files, _ = copy_directory(
                controllers_folder,
                target_api / collection_name / 'controllers',
                f'Controllers {collection_name}'
            )
            migrated += files
        
        # Services
        services_folder = api_folder / 'services'
        if services_folder.exists():
            files, _ = copy_directory(
                services_folder,
                target_api / collection_name / 'services',
                f'Services {collection_name}'
            )
            migrated += files
        
        # Routes
        routes_folder = api_folder / 'routes'
        if routes_folder.exists():
            files, _ = copy_directory(
                routes_folder,
                target_api / collection_name / 'routes',
                f'Routes {collection_name}'
            )
            migrated += files
    
    print()
    return migrated


def migrate_global_lifecycles(source: Path, target: Path) -> int:
    """Migra src/index.ts (global lifecycles)"""
    print_step('Migrazione global lifecycles', 8, 4, 'Migrazione src/index.ts')
    
    files, success = copy_file(
        source / 'src' / 'index.ts',
        target / 'src' / 'index.ts',
        'src/index.ts (PathResolver, AutoSlug, SEO, DefaultPath)',
        create_backup=True
    )
    
    if success:
        print_detail('PathResolver invalidation subscriber')
        print_detail('Auto-slug generation (slugify)')
        print_detail('SEO auto-populate lifecycle')
        print_detail('Default-path hierarchical management')
    
    print()
    return files


def migrate_utils(source: Path, target: Path) -> int:
    """Migra src/utils"""
    print_step('Migrazione utils', 8, 5, 'Migrazione src/utils')
    
    files, success = copy_directory(
        source / 'src' / 'utils',
        target / 'src' / 'utils',
        'Utils (SEO auto-populate)'
    )
    
    if success:
        print_detail('seo-auto-populate.ts (strip HTML, keywords, OpenGraph)')
    
    print()
    return files


def manage_dependencies(target: Path) -> bool:
    """Verifica e suggerisce dipendenze necessarie"""
    print_step('Verifica dipendenze', 8, 6, 'Verifica dipendenze')
    
    target_package = target / 'package.json'
    
    try:
        with open(target_package, 'r', encoding='utf-8') as f:
            pkg_data = json.load(f)
        
        deps = pkg_data.get('dependencies', {})
        required_deps = {
            'slugify': '^1.6.6',
        }
        
        missing = []
        for dep, version in required_deps.items():
            if dep not in deps:
                missing.append(f'{dep}@{version}')
        
        if missing:
            print_warning('Dipendenze mancanti rilevate:')
            for dep in missing:
                print_detail(dep)
            print()
            print_info('Installale con:')
            print_detail(f'npm install {" ".join(missing)}')
            print()
        else:
            print_success('Tutte le dipendenze necessarie sono presenti')
            print()
        
        return True
        
    except Exception as e:
        print_error(f'Errore verifica dipendenze: {e}')
        return False


def main():
    parser = argparse.ArgumentParser(
        description='FASE 2: Migra services, controllers, routes e lifecycles (CORE)'
    )
    parser.add_argument(
        '--target',
        type=str,
        required=True,
        help='Percorso al progetto Strapi target (es: C:\\progetti\\strapi-docker)'
    )
    
    args = parser.parse_args()
    
    print()
    print_header('🔶 MIGRAZIONE FASE 2: CORE BUSINESS LOGIC', Colors.YELLOW)
    print_info('Prerequisiti: FASE 1 completata ✓')
    print_info('Rischio: MEDIO ⚠️')
    print_info('Tempo test stimato: 2-4 ore')
    print()
    
    # Validazione
    source_path, target_path = validate_paths(args.target)
    
    # Contatori
    total_files = 0
    
    # Migrazione
    total_files += migrate_api_common(source_path, target_path)
    total_files += migrate_collection_controllers_services_routes(source_path, target_path)
    total_files += migrate_global_lifecycles(source_path, target_path)
    total_files += migrate_utils(source_path, target_path)
    manage_dependencies(target_path)
    
    # Riepilogo
    print_header('📊 RIEPILOGO FASE 2', Colors.GREEN)
    print_success(f'Files migrati: {total_files}')
    print()
    
    print_header('✅ PROSSIMI PASSI', Colors.YELLOW)
    print_detail('1. Installa dipendenze mancanti (se presenti)')
    print_detail('2. Riavvia Strapi nel container Docker')
    print_detail('3. Verifica endpoint custom:')
    print_detail('   - GET /api/resolve-path/:path')
    print_detail('   - GET /api/archivio/:contentType')
    print_detail('   - POST /api/unpublish/:contentType/:documentId')
    print_detail('4. Testa creazione contenuti (auto-slug, SEO auto-populate)')
    print_detail('5. Verifica cache PathResolver inizializzata')
    print_detail('6. Testa path gerarchici (DefaultPath)')
    print()
    print_detail('Se tutto OK → Procedi con FASE 3 (Plugin + Admin)')
    print()


if __name__ == '__main__':
    main()
