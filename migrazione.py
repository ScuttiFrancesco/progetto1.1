#!/usr/bin/env python3
"""
====================================
Migrazione Custom Features Script
====================================
Questo script migra automaticamente tutte le funzionalità custom
dal progetto corrente a un altro progetto Strapi.

PREREQUISITI:
1. Essere nella root del progetto Strapi SORGENTE (questo progetto)
2. Il progetto TARGET deve essere un progetto Strapi valido

USO:
    python migrazione.py --target "C:\\path\\to\\nuovo\\progetto"
    
    # Oppure con eseguibile standalone (vedi README):
    migrazione.exe --target "C:\\path\\to\\nuovo\\progetto"

Autore: Generato automaticamente
Data: 2025-10-20
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

# Colori per output (compatibile Windows/Linux/Mac)
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    GRAY = '\033[90m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# Disabilita colori su Windows vecchi (opzionale)
if sys.platform == 'win32':
    try:
        import colorama
        colorama.init()
    except ImportError:
        # Se colorama non disponibile, usa stringhe vuote
        Colors.CYAN = Colors.GREEN = Colors.YELLOW = ''
        Colors.RED = Colors.GRAY = Colors.WHITE = Colors.RESET = Colors.BOLD = ''


def print_header(text: str, color=Colors.CYAN):
    """Stampa un header formattato"""
    print(f"{color}{'=' * 40}{Colors.RESET}")
    print(f"{color}  {text}{Colors.RESET}")
    print(f"{color}{'=' * 40}{Colors.RESET}")
    print()


def print_step(step: str, total: int, current: int, text: str):
    """Stampa un passo della migrazione"""
    print(f"{Colors.CYAN}[{current}/{total}] {text}...{Colors.RESET}")


def print_success(text: str, indent: str = '   '):
    """Stampa messaggio di successo"""
    print(f"{indent}{Colors.GREEN}[OK] {text}{Colors.RESET}")


def print_error(text: str, indent: str = '   '):
    """Stampa messaggio di errore"""
    print(f"{indent}{Colors.RED}[ERRORE] {text}{Colors.RESET}")


def print_warning(text: str, indent: str = '   '):
    """Stampa messaggio di warning"""
    print(f"{indent}{Colors.YELLOW}[WARNING] {text}{Colors.RESET}")


def print_info(text: str, indent: str = '   '):
    """Stampa messaggio informativo"""
    print(f"{indent}{Colors.YELLOW}[INFO] {text}{Colors.RESET}")


def print_detail(text: str, indent: str = '        '):
    """Stampa dettaglio grigio"""
    print(f"{indent}{Colors.GRAY}{text}{Colors.RESET}")


def validate_paths(target_path: str) -> Tuple[Path, Path]:
    """
    Valida i percorsi sorgente e target
    Returns: (source_path, target_path)
    """
    print_step('Validazione percorsi', 9, 1, 'Validazione percorsi')
    
    # 1. Verifica che siamo nella root del progetto sorgente
    source_path = Path.cwd()
    package_json_path = source_path / 'package.json'
    
    if not package_json_path.exists():
        print_error('Non sei nella root di un progetto Strapi!')
        print_warning(f'Cartella corrente: {source_path}')
        print()
        print_warning('Esegui questo script dalla root del progetto Strapi SORGENTE')
        sys.exit(1)
    
    # 2. Verifica che il progetto sorgente sia Strapi
    with open(package_json_path, 'r', encoding='utf-8') as f:
        source_package = json.load(f)
    
    if '@strapi/strapi' not in source_package.get('dependencies', {}):
        print_error('Questo non sembra un progetto Strapi!')
        sys.exit(1)
    
    # 3. Verifica che il percorso target esista
    target_path = Path(target_path).resolve()
    
    if not target_path.exists():
        print_error('Il percorso target non esiste!')
        print_warning(f'Path: {target_path}')
        sys.exit(1)
    
    # 4. Verifica che il target sia un progetto Strapi
    target_package_json = target_path / 'package.json'
    
    if not target_package_json.exists():
        print_error('Il progetto target non ha un package.json!')
        print_warning(f'Path: {target_path}')
        sys.exit(1)
    
    with open(target_package_json, 'r', encoding='utf-8') as f:
        target_package = json.load(f)
    
    if '@strapi/strapi' not in target_package.get('dependencies', {}):
        print_error('Il progetto target non sembra un progetto Strapi!')
        sys.exit(1)
    
    # 5. Verifica che non siano lo stesso progetto
    if source_path.resolve() == target_path.resolve():
        print_error('Il progetto sorgente e target sono lo stesso!')
        print_warning('Non puoi migrare un progetto su se stesso')
        sys.exit(1)
    
    print_success('Validazioni completate')
    print()
    print(f"{Colors.WHITE}   Sorgente: {source_path}{Colors.RESET}")
    print(f"{Colors.WHITE}   Target:   {target_path}{Colors.RESET}")
    print()
    print_warning('NOTA: Verranno migrati anche content-types e components')
    print()
    
    return source_path, target_path


def confirm_migration() -> bool:
    """Chiede conferma all'utente"""
    try:
        response = input('Vuoi procedere con la migrazione? (s/n): ').lower().strip()
        return response == 's'
    except KeyboardInterrupt:
        print()
        print_error('Migrazione annullata dall\'utente')
        return False


def copy_directory(source: Path, target: Path, description: str) -> Tuple[int, bool]:
    """
    Copia una directory ricorsivamente
    Returns: (numero_file_copiati, successo)
    """
    try:
        if not source.exists():
            print_warning(f'{description} non trovato')
            return 0, False
        
        # Crea directory parent se non esiste
        target.parent.mkdir(parents=True, exist_ok=True)
        
        # Rimuovi target se esiste
        if target.exists():
            shutil.rmtree(target)
        
        # Copia ricorsivamente
        shutil.copytree(source, target)
        
        # Conta files
        file_count = sum(1 for _ in target.rglob('*') if _.is_file())
        
        print_success(f'{description} migrato ({file_count} files)')
        return file_count, True
        
    except Exception as e:
        print_error(f'Errore migrazione {description}: {e}')
        return 0, False


def copy_file(source: Path, target: Path, description: str, create_backup: bool = True) -> Tuple[int, bool]:
    """
    Copia un singolo file
    Returns: (1 se successo 0 altrimenti, successo)
    """
    try:
        if not source.exists():
            print_warning(f'{description} non trovato')
            return 0, False
        
        # Backup se richiesto e file esiste
        if create_backup and target.exists():
            backup_path = Path(str(target) + '.backup')
            shutil.copy2(target, backup_path)
            print_info(f'Backup creato: {backup_path.name}')
        
        # Crea directory parent se non esiste
        target.parent.mkdir(parents=True, exist_ok=True)
        
        # Copia file
        shutil.copy2(source, target)
        
        print_success(f'{description} migrato')
        return 1, True
        
    except Exception as e:
        print_error(f'Errore migrazione {description}: {e}')
        return 0, False


def migrate_files(source: Path, target: Path) -> Tuple[int, int]:
    """
    Migra tutti i file necessari
    Returns: (file_migrati, errori)
    """
    migrated_files = 0
    errors = 0
    
    # 1. Migrazione Plugin Tree-View
    print_step('Migrazione plugin tree-view', 9, 2, 'Migrazione plugin tree-view')
    files, success = copy_directory(
        source / 'src' / 'plugins' / 'tree-view',
        target / 'src' / 'plugins' / 'tree-view',
        'Plugin tree-view'
    )
    migrated_files += files
    if not success and files == 0:
        pass  # Warning già stampato
    elif not success:
        errors += 1
    print()
    
    # 2. Migrazione API Common (AGGIORNATO CON NUOVE FUNZIONALITÀ)
    print_step('Migrazione API Common', 9, 3, 'Migrazione API Common')
    files, success = copy_directory(
        source / 'src' / 'api' / 'common',
        target / 'src' / 'api' / 'common',
        'API Common'
    )
    migrated_files += files
    if success:
        print_detail('- archivio controller/routes')
        print_detail('- unpublish controller/routes')
        print_detail('- path-resolver service/controller/routes (gestione path duplicati)')
        print_detail('- default-path service')
        print_detail('- content-type placeholder (nascosto)')
    elif not success and files == 0:
        pass
    else:
        errors += 1
    print()
    
    # 3. Migrazione TUTTE le Collection Types (src/api/)
    print_step('Migrazione collection types', 9, 4, 'Migrazione collection types')
    
    source_api = source / 'src' / 'api'
    target_api = target / 'src' / 'api'
    
    if source_api.exists():
        # Trova tutte le cartelle in src/api/ (escluso 'common' già migrato)
        api_folders = [f for f in source_api.iterdir() if f.is_dir() and f.name != 'common']
        
        if api_folders:
            print_info(f'Trovate {len(api_folders)} collection types da migrare:')
            for folder in api_folders:
                print_detail(f'  - {folder.name}')
            print()
            
            collection_count = 0
            for folder in api_folders:
                files, success = copy_directory(
                    folder,
                    target_api / folder.name,
                    f'Collection "{folder.name}"'
                )
                migrated_files += files
                if success:
                    collection_count += 1
                elif not success and files > 0:
                    errors += 1
            
            print()
            print_success(f'{collection_count}/{len(api_folders)} collection types migrate correttamente')
        else:
            print_warning('Nessuna collection type custom trovata (escluso common)')
    else:
        print_warning('Cartella src/api/ non trovata')
    
    print()
    
    # 4. Migrazione Components
    print_step('Migrazione components', 9, 5, 'Migrazione components')
    files, success = copy_directory(
        source / 'src' / 'components',
        target / 'src' / 'components',
        'Components'
    )
    migrated_files += files
    if success:
        print_detail('- url/url-addizionali (per default-path)')
        print_detail('- altri components custom')
    elif not success and files == 0:
        pass
    else:
        errors += 1
    print()
    
    # 5. Migrazione src/utils (SEO auto-populate)
    print_step('Migrazione src/utils', 9, 5.5, 'Migrazione src/utils')
    files, success = copy_directory(
        source / 'src' / 'utils',
        target / 'src' / 'utils',
        'Utils (SEO auto-populate)'
    )
    migrated_files += files
    if success:
        print_detail('- seo-auto-populate.ts (auto-popolamento SEO)')
    elif not success and files == 0:
        pass
    else:
        errors += 1
    print()
    
    # 6. Migrazione src/index.ts (Global Subscriber)
    print_step('Migrazione src/index.ts', 9, 6, 'Migrazione src/index.ts')
    files, success = copy_file(
        source / 'src' / 'index.ts',
        target / 'src' / 'index.ts',
        'src/index.ts (global subscriber + default-path logic)',
        create_backup=True
    )
    migrated_files += files
    if not success and files == 0:
        pass
    elif not success:
        errors += 1
    print()
    
    # 7. Migrazione Config Files
    print_step('Migrazione file di configurazione', 9, 7, 'Migrazione file di configurazione')
    
    config_files = [
        ('admin.ts', 'config/admin.ts'),
        ('plugins.ts', 'config/plugins.ts'),
    ]
    
    for filename, description in config_files:
        files, success = copy_file(
            source / 'config' / filename,
            target / 'config' / filename,
            description,
            create_backup=True
        )
        migrated_files += files
        if not success and files > 0:
            errors += 1
    
    print()
    
    return migrated_files, errors


def manage_dependencies(target: Path) -> int:
    """
    Gestisce l'installazione delle dipendenze
    Returns: errori
    """
    errors = 0
    
    print_step('Gestione dipendenze', 9, 8, 'Gestione dipendenze')
    
    required_deps = {
        '@strapi-community/strapi-provider-upload-google-cloud-storage': '^5.0.5',
        'slugify': '^1.6.6',
    }
    
    required_dev_deps = {
        '@types/node': '^20.19.21',
    }
    
    print_warning('Dipendenze richieste:')
    for dep, version in required_deps.items():
        print_detail(f'- {dep}@{version}')
    
    print()
    
    try:
        response = input('Vuoi installare le dipendenze nel progetto target ora? (s/n): ').lower().strip()
        install_deps = response == 's'
    except KeyboardInterrupt:
        print()
        install_deps = False
    
    if install_deps:
        print_info('Installazione dipendenze nel progetto target...')
        
        # Cambia directory al target
        original_dir = os.getcwd()
        os.chdir(target)
        
        try:
            for dep, version in required_deps.items():
                dep_string = f'{dep}@{version}'
                print_detail(f'Installing {dep_string}...')
                
                result = subprocess.run(
                    ['npm', 'install', dep_string],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode != 0:
                    print_error(f'Errore installando {dep_string}')
                    errors += 1
            
            for dep in required_dev_deps.keys():
                print_detail(f'Installing {dep} (dev)...')
                
                result = subprocess.run(
                    ['npm', 'install', '--save-dev', dep],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode != 0:
                    print_error(f'Errore installando {dep}')
                    errors += 1
            
            if errors == 0:
                print_success('Dipendenze installate')
            
        except Exception as e:
            print_error(f'Errore durante installazione dipendenze: {e}')
            errors += 1
        finally:
            # Ritorna alla directory originale
            os.chdir(original_dir)
    else:
        print_warning('Installazione dipendenze saltata')
        print_info('Esegui manualmente nel progetto target:')
        for dep, version in required_deps.items():
            print_detail(f'npm install {dep}@{version}')
    
    print()
    return errors


def verify_env(target: Path):
    """Verifica la configurazione .env"""
    print_step('Verifica configurazione .env', 9, 9, 'Verifica configurazione .env')
    
    env_file = target / '.env'
    env_vars_needed = [
        'CLIENT_URL',
        'PREVIEW_SECRET',
    ]
    
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            env_content = f.read()
        
        missing_vars = [var for var in env_vars_needed if f'{var}=' not in env_content]
        
        if missing_vars:
            print_warning('Variabili ambiente mancanti nel progetto target:')
            for var in missing_vars:
                print(f"      {Colors.RED}- {var}{Colors.RESET}")
            print()
            print_info('Aggiungi queste righe al file .env del progetto target:')
            print_detail('CLIENT_URL=http://localhost:4200')
            print_detail('PREVIEW_SECRET=la-mia-super-segreta-chiave-di-preview')
        else:
            print_success('Tutte le variabili ambiente sono configurate')
    else:
        print_warning('File .env non trovato nel progetto target')
        print()
        print_info('Crea un file .env nella root del progetto target con:')
        print_detail('CLIENT_URL=http://localhost:4200')
        print_detail('PREVIEW_SECRET=la-mia-super-segreta-chiave-di-preview')
        print_detail('GCS_SERVICE_ACCOUNT={"type":"service_account",...} (opzionale)')
        print_detail('GCS_BUCKET_NAME=your-bucket-name (opzionale)')
    
    print()


def print_summary(migrated_files: int, errors: int):
    """Stampa il riepilogo finale"""
    print_header('Riepilogo Migrazione', Colors.CYAN)
    print(f"{Colors.GREEN}[OK] File migrati:  {migrated_files}{Colors.RESET}")
    print(f"{Colors.RED}[ERRORE] Errori:    {errors}{Colors.RESET}")
    print()
    
    if errors == 0:
        print(f"{Colors.GREEN}[SUCCESS] Migrazione completata con successo!{Colors.RESET}")
        print()
        print(f"{Colors.YELLOW}File migrati:{Colors.RESET}")
        print(f"{Colors.WHITE}  - src/plugins/tree-view/{Colors.RESET}")
        print(f"{Colors.WHITE}  - src/api/common/ (archivio, unpublish, path-resolver con filtro duplicati, default-path){Colors.RESET}")
        print(f"{Colors.WHITE}  - src/api/*/ (TUTTE le collection types custom){Colors.RESET}")
        print(f"{Colors.WHITE}  - src/components/ (TUTTI i components custom){Colors.RESET}")
        print(f"{Colors.WHITE}  - src/index.ts (global subscriber + default-path){Colors.RESET}")
        print(f"{Colors.WHITE}  - config/admin.ts (preview config){Colors.RESET}")
        print(f"{Colors.WHITE}  - config/plugins.ts (GCS upload + tree-view){Colors.RESET}")
        print()
        print(f"{Colors.YELLOW}Prossimi passi nel progetto target:{Colors.RESET}")
        print(f"{Colors.WHITE}  1. Verifica il file .env (vedi sopra){Colors.RESET}")
        print(f"{Colors.WHITE}  2. Se non hai installato le dipendenze, eseguile{Colors.RESET}")
        print(f"{Colors.WHITE}  3. Esegui: npm run build{Colors.RESET}")
        print(f"{Colors.WHITE}  4. Esegui: npm run develop{Colors.RESET}")
        print(f"{Colors.WHITE}  5. Verifica nei log:{Colors.RESET}")
        print(f"{Colors.GRAY}     - [PathResolver] Inizializzazione mappa dei path{Colors.RESET}")
        print(f"{Colors.GRAY}     - [PathResolver] ✅ Subscriber globale registrato{Colors.RESET}")
        print(f"{Colors.GRAY}     - [DefaultPath] Monitoro le collection con path di default{Colors.RESET}")
        print()
        print(f"{Colors.YELLOW}Funzionalità migrate:{Colors.RESET}")
        print(f"{Colors.WHITE}  - Tree-view plugin (visualizzazione gerarchica content){Colors.RESET}")
        print(f"{Colors.WHITE}  - Path Resolver (dynamic routing con cache O(1)){Colors.RESET}")
        print(f"{Colors.WHITE}  - Default Path (path gerarchici automatici per parent/child){Colors.RESET}")
        print(f"{Colors.WHITE}  - Archivio API (archivio gerarchico anno/mese/giorno){Colors.RESET}")
        print(f"{Colors.WHITE}  - Unpublish API (unpublish universale per tutti i content-type){Colors.RESET}")
        print(f"{Colors.WHITE}  - Global Subscriber (invalidazione cache automatica){Colors.RESET}")
        print(f"{Colors.WHITE}  - Preview Configuration (anteprima content in Angular){Colors.RESET}")
        print()
    else:
        print(f"{Colors.YELLOW}[WARNING] Migrazione completata con errori!{Colors.RESET}")
        print(f"{Colors.GRAY}  Controlla i messaggi sopra per dettagli{Colors.RESET}")
        print()
    
    print(f"{Colors.CYAN}Per maggiori informazioni leggi: docs/SQLITE_TO_POSTGRES_MIGRATION.md{Colors.RESET}")
    print()


def main():
    """Funzione principale"""
    parser = argparse.ArgumentParser(
        description='Migra funzionalità custom da questo progetto Strapi ad un altro',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Esempio:
    python migrazione.py --target "C:\\path\\to\\nuovo\\progetto"
    
    # Con eseguibile standalone:
    migrazione.exe --target "C:\\path\\to\\nuovo\\progetto"
        """
    )
    
    parser.add_argument(
        '--target',
        required=True,
        help='Percorso del progetto Strapi target'
    )
    
    args = parser.parse_args()
    
    # Header
    print()
    print_header('Strapi Custom Features - Migrazione')
    
    try:
        # 1. Validazione
        source, target = validate_paths(args.target)
        
        # 2. Conferma
        if not confirm_migration():
            print_error('Migrazione annullata.')
            sys.exit(1)
        
        print()
        
        # 3. Migrazione files
        migrated_files, file_errors = migrate_files(source, target)
        
        # 4. Gestione dipendenze
        dep_errors = manage_dependencies(target)
        
        # 5. Verifica .env
        verify_env(target)
        
        # 6. Riepilogo
        total_errors = file_errors + dep_errors
        print_summary(migrated_files, total_errors)
        
        # Exit code
        sys.exit(0 if total_errors == 0 else 1)
        
    except KeyboardInterrupt:
        print()
        print_error('Migrazione interrotta dall\'utente')
        sys.exit(1)
    except Exception as e:
        print()
        print_error(f'Errore imprevisto: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
