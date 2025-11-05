#!/usr/bin/env python3
"""
====================================
MIGRAZIONE FASE 3: Plugin + Admin + Configurazioni Avanzate
====================================
Migra plugin custom, admin customizations e configurazioni avanzate.
Questa è la fase più RISCHIOSA - include modifiche UI e integrazioni esterne.

PREREQUISITI:
✅ FASE 1 completata e testata con successo
✅ FASE 2 completata e testata con successo

COSA MIGRA:
- Plugin custom (tree-view)
- Admin customizations (src/admin/app.tsx - nascondi menu)
- Configurazioni avanzate (config/admin.ts, config/plugins.ts)
- Extensions (content-manager customizations)

COSA NON MIGRA:
- .env (da configurare manualmente)
- Credenziali GCS (da configurare in .env)
- Database (da migrare separatamente)
- node_modules (da reinstallare)

RISCHIO: ALTO 🔴
TEMPO TEST: 4-8 ore

NOTE IMPORTANTI:
- config/plugins.ts contiene configurazione GCS → verificare credenziali in .env
- config/admin.ts contiene preview mode → verificare CLIENT_URL in .env
- tree-view plugin potrebbe richiedere ricompilazione admin panel
- Admin customizations potrebbero non funzionare con Strapi 5.30 (testare!)

USO:
    python migrazione_fase3.py --target "C:\\path\\to\\progetto\\docker"

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
    print_step('Validazione percorsi', 7, 1, 'Validazione percorsi')
    
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


def migrate_tree_view_plugin(source: Path, target: Path) -> int:
    """Migra plugin tree-view"""
    print_step('Migrazione plugin tree-view', 7, 2, 'Migrazione plugin tree-view')
    
    files, success = copy_directory(
        source / 'src' / 'plugins' / 'tree-view',
        target / 'src' / 'plugins' / 'tree-view',
        'Plugin tree-view'
    )
    
    if success:
        print_detail('Visualizzazione gerarchica ad albero')
        print_detail('Drag-and-drop riorganizzazione')
        print_detail('Supporto multi-collection')
        print()
        print_warning('ATTENZIONE: Potrebbe richiedere rebuild admin panel!')
        print_detail('Esegui: npm run build')
    
    print()
    return files


def migrate_admin_customizations(source: Path, target: Path) -> int:
    """Migra customizations admin panel"""
    print_step('Migrazione admin customizations', 7, 3, 'Migrazione admin customizations')
    
    migrated = 0
    
    # src/admin/app.tsx (nascondi menu)
    app_file = source / 'src' / 'admin' / 'app.tsx'
    if app_file.exists():
        files, success = copy_file(
            app_file,
            target / 'src' / 'admin' / 'app.tsx',
            'src/admin/app.tsx (nascondi Deploy/Marketplace)',
            create_backup=True
        )
        migrated += files
        
        if success:
            print_detail('Nascondi menu Deploy per ruoli Editor/Author')
            print_detail('Nascondi menu Marketplace')
            print()
            print_warning('TESTARE con Strapi 5.30 - potrebbe non funzionare!')
    else:
        print_warning('src/admin/app.tsx non trovato (cerco app.example.tsx)')
        
        app_example = source / 'src' / 'admin' / 'app.example.tsx'
        if app_example.exists():
            files, success = copy_file(
                app_example,
                target / 'src' / 'admin' / 'app.tsx',
                'src/admin/app.example.tsx → app.tsx',
                create_backup=True
            )
            migrated += files
    
    print()
    return migrated


def migrate_extensions(source: Path, target: Path) -> int:
    """Migra extensions (content-manager, etc.)"""
    print_step('Migrazione extensions', 7, 4, 'Migrazione extensions')
    
    files, success = copy_directory(
        source / 'src' / 'extensions',
        target / 'src' / 'extensions',
        'Extensions (content-manager customizations)'
    )
    
    print()
    return files


def migrate_advanced_configs(source: Path, target: Path) -> int:
    """Migra configurazioni avanzate"""
    print_step('Migrazione configurazioni avanzate', 7, 5, 'Migrazione configurazioni avanzate')
    
    migrated = 0
    
    # config/admin.ts (preview mode)
    files, success = copy_file(
        source / 'config' / 'admin.ts',
        target / 'config' / 'admin.ts',
        'config/admin.ts (preview mode, security)',
        create_backup=True
    )
    migrated += files
    
    if success:
        print_detail('Preview mode configurato')
        print_detail('Security tokens (JWT, API, Transfer)')
        print()
        print_warning('IMPORTANTE: Verifica CLIENT_URL in .env!')
        print_warning('IMPORTANTE: Verifica PREVIEW_SECRET in .env!')
        print()
    
    # config/plugins.ts (GCS upload)
    files, success = copy_file(
        source / 'config' / 'plugins.ts',
        target / 'config' / 'plugins.ts',
        'config/plugins.ts (GCS upload provider)',
        create_backup=True
    )
    migrated += files
    
    if success:
        print_detail('Google Cloud Storage upload provider')
        print_detail('Path intelligente: folder/contentType/slug/filename')
        print_detail('Slugify automatico nomi file')
        print()
        print_warning('CRITICO: Configura credenziali GCS in .env!')
        print_detail('Variabili necessarie:')
        print_detail('  - GCS_SERVICE_ACCOUNT')
        print_detail('  - GCS_BUCKET_NAME')
        print_detail('  - GCS_BASE_PATH (opzionale)')
        print()
    
    print()
    return migrated


def manage_dependencies(target: Path) -> bool:
    """Verifica e suggerisce dipendenze necessarie"""
    print_step('Verifica dipendenze avanzate', 7, 6, 'Verifica dipendenze avanzate')
    
    target_package = target / 'package.json'
    
    try:
        with open(target_package, 'r', encoding='utf-8') as f:
            pkg_data = json.load(f)
        
        deps = pkg_data.get('dependencies', {})
        required_deps = {
            '@strapi-community/strapi-provider-upload-google-cloud-storage': '^5.0.5',
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
        description='FASE 3: Migra plugin, admin customizations e configurazioni avanzate (RISCHIO ALTO)'
    )
    parser.add_argument(
        '--target',
        type=str,
        required=True,
        help='Percorso al progetto Strapi target (es: C:\\progetti\\strapi-docker)'
    )
    
    args = parser.parse_args()
    
    print()
    print_header('🔴 MIGRAZIONE FASE 3: PLUGIN + ADMIN + CONFIG AVANZATE', Colors.RED)
    print_info('Prerequisiti: FASE 1 ✓ e FASE 2 ✓ completate')
    print_info('Rischio: ALTO 🔴')
    print_info('Tempo test stimato: 4-8 ore')
    print()
    print_warning('ATTENZIONE: Questa fase modifica UI e integrazioni esterne!')
    print()
    
    # Validazione
    source_path, target_path = validate_paths(args.target)
    
    # Contatori
    total_files = 0
    
    # Migrazione
    total_files += migrate_tree_view_plugin(source_path, target_path)
    total_files += migrate_admin_customizations(source_path, target_path)
    total_files += migrate_extensions(source_path, target_path)
    total_files += migrate_advanced_configs(source_path, target_path)
    manage_dependencies(target_path)
    
    # Riepilogo
    print_header('📊 RIEPILOGO FASE 3', Colors.GREEN)
    print_success(f'Files migrati: {total_files}')
    print()
    
    print_header('⚠️ CONFIGURAZIONE .ENV OBBLIGATORIA', Colors.RED)
    print_detail('Aggiungi/verifica queste variabili in .env:')
    print()
    print_detail('# Frontend Preview')
    print_detail('CLIENT_URL=https://tuo-frontend-test.com')
    print_detail('PREVIEW_SECRET=la-tua-chiave-segreta-preview')
    print()
    print_detail('# Google Cloud Storage')
    print_detail('GCS_SERVICE_ACCOUNT={"type":"service_account",...}')
    print_detail('GCS_BUCKET_NAME=tuo-bucket-name')
    print_detail('GCS_BASE_PATH=uploads (opzionale)')
    print()
    
    print_header('✅ PROSSIMI PASSI', Colors.YELLOW)
    print_detail('1. Configura .env con variabili sopra indicate')
    print_detail('2. Installa dipendenze mancanti (se presenti)')
    print_detail('3. Rebuild admin panel: npm run build')
    print_detail('4. Riavvia Strapi nel container Docker')
    print_detail('5. Testa plugin tree-view nell\'admin')
    print_detail('6. Verifica menu Deploy/Marketplace nascosti per Editor')
    print_detail('7. Testa preview mode (se frontend disponibile)')
    print_detail('8. Testa upload file su GCS bucket')
    print_detail('9. Verifica path file generati: folder/contentType/slug/filename')
    print()
    print_header('🎉 MIGRAZIONE COMPLETA', Colors.GREEN)
    print_success('Tutte e 3 le fasi completate!')
    print()


if __name__ == '__main__':
    main()
