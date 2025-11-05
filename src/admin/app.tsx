import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
   locales: ['it', 'en'],
    translations: {
      it: {
        'Header-Bar': 'Barra Intestazione',
        'header-bar': 'barra intestazione',
        'Deploy': 'Deploy',
        'Marketplace': 'Marketplace',
        'marketplace': 'marketplace',
        'Content Manager': 'Gestione Contenuti',
        'content-manager': 'gestione contenuti',
        'content-manager.plugin.name': 'Gestione Contenuti',
        'Media Library': 'Libreria Media',
        'media-library': 'libreria media',
        'Settings': 'Impostazioni',
        'settings': 'impostazioni',
        'cloud.plugin.name': 'Deploy',
        'export-import-kkm.plugin.name': 'Export Import KKM',
        'soft-delete.plugin.name': 'Soft Delete',
        'Pagina': 'Pagina',
        'pagina': 'pagina'
      }
    },
    tutorials: false,
    notifications: { releases: false },
  },
 bootstrap(app: StrapiApp) {
    // Sopprimi gli errori di traduzione mancante nella console
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('[@formatjs/intl Error MISSING_TRANSLATION]')) {
        // Sopprimi questo specifico errore di traduzione
        return;
      }
      // Per tutti gli altri errori, usa il comportamento normale
      originalConsoleError.apply(console, args);
    };

    // Lista dei link che vogliamo nascondere
    const linksToHide = ['Deploy', 'Marketplace'];
    // Lista dei ruoli che NON devono vedere questi link
    const restrictedRoles = ['Editor', 'Author',];
    // Fallback SICURO: assumiamo Super Admin se non troviamo nulla
    let CURRENT_USER_ROLE = 'Super Admin';

    // Funzione per recuperare il ruolo dell'utente corrente
    const getUserRole = async () => {
      try {
        // Cerca il token di autenticazione nei cookie
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };

        const token = getCookie('jwtToken');
        
        if (token) {
          const response = await fetch('http://localhost:1337/admin/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            const role = userData.data?.roles?.[0]?.name || userData.roles?.[0]?.name || userData.role?.name;
            
            if (role) {
              CURRENT_USER_ROLE = role;
              return role;
            }
          }
        }

        return CURRENT_USER_ROLE;
      } catch (error) {
        return CURRENT_USER_ROLE;
      }
    };

    // Metodo per nascondere i link dal menu
    const hideMenuLinks = async () => {
      const userRole = await getUserRole();

      // Controlla se il ruolo corrente è in quelli ristretti
      if (!restrictedRoles.includes(userRole)) {
        return; // Non nascondere nulla
      }

      // Procedi a nascondere i link dopo un breve delay
      setTimeout(() => {
        linksToHide.forEach(linkId => {
          // Selettori multipli per trovare il link
          const selectors = [
            // Selettori standard
            `[href*="${linkId}"]`,
            `[href*="${linkId.toLowerCase()}"]`,
            `a[href$="/${linkId}"]`,
            `a[href$="/${linkId.toLowerCase()}"]`,
            // Selettori specifici per il plugin cloud (Deploy)
            `[href="/admin/plugins/cloud"]`,
            `[href*="/plugins/cloud"]`,
            // Selettori per marketplace
            `[href="/admin/marketplace"]`,
            `[href*="/marketplace"]`,
          ];

          let found = false;
          for (const selector of selectors) {
            try {
              const linkElements = document.querySelectorAll(selector);
              linkElements.forEach(linkElement => {
                if (linkElement) {
                  const menuItem = linkElement.closest('li') || 
                                  linkElement.closest('a') || 
                                  linkElement.closest('[role="menuitem"]') ||
                                  linkElement.parentElement;
                  if (menuItem) {
                    (menuItem as HTMLElement).style.display = 'none';
                    found = true;
                  }
                }
              });
            } catch (e) {
              // Ignora errori di selettore non valido
            }
          }

          // Se non trovato, cerca nel testo dei link (case-insensitive)
          if (!found) {
            const allLinks = document.querySelectorAll('a, [role="menuitem"], nav a');
            allLinks.forEach(link => {
              const text = (link as HTMLElement).textContent?.toLowerCase().trim();
              if (text && (text === linkId.toLowerCase() || text.includes(linkId.toLowerCase()))) {
                const menuItem = link.closest('li') || 
                                link.closest('a') || 
                                link.closest('[role="menuitem"]') ||
                                link.parentElement;
                if (menuItem) {
                  (menuItem as HTMLElement).style.display = 'none';
                  found = true;
                }
              }
            });
          }
        });
      }, 1500);
    };

    // Aspetta che l'app di Strapi sia completamente caricata
    const initHideLinks = async () => {
      setTimeout(async () => await hideMenuLinks(), 1000);
      setTimeout(async () => await hideMenuLinks(), 2000);
      setTimeout(async () => await hideMenuLinks(), 3000);
    };

    // Esegui la funzione all'avvio
    initHideLinks();

    // Osserva i cambiamenti nel DOM per nascondere i link anche dopo navigazioni
    const observer = new MutationObserver(async () => {
      await hideMenuLinks();
    });

    // Inizia l'osservazione quando il body è disponibile
    setTimeout(() => {
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }, 1000);
  },
};

