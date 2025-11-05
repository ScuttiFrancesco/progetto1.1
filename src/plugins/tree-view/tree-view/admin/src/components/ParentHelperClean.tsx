import React, { useEffect, useState } from 'react';

interface ParentInfo {
  parentId: string;
  parentDocumentId: string;
  parentLabel: string;
  parentSlug: string;
}

export const ParentHelperClean: React.FC = () => {
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'manual' | 'error'>('loading');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {

  }, []);

  useEffect(() => {
    const handleParentSelection = async () => {

      const parentInfoString = sessionStorage.getItem('parentInfo');
      
      if (!parentInfoString) {

        setIsVisible(false);
        return;
      }

      try {
        const info = JSON.parse(parentInfoString);

        setParentInfo(info);
        sessionStorage.removeItem('parentInfo');

        const success = await forceRelationDirectly(info);
        
        setStatus(success ? 'success' : 'manual');
        
        if (success) {

          setTimeout(() => setIsVisible(false), 5000);
        } else {

          setTimeout(() => setIsVisible(false), 8000);
        }
        
      } catch (error) {

        setStatus('error');
        setTimeout(() => setIsVisible(false), 5000);
      }
    };

    handleParentSelection();
  }, []);

  const forceRelationDirectly = async (info: ParentInfo): Promise<boolean> => {
    try {

      // Funzione per estrarre documentId dall'URL
      const extractDocumentId = (url: string): string | null => {

        // Pattern per Strapi v5 con documentId
        const patterns = [
          /\/content-manager\/collection-types\/[^\/]+\/([a-zA-Z0-9-_]+)(?:\?|$)/,
          /\/pagina\/([a-zA-Z0-9-_]+)(?:\?|$)/,
          /\/([a-zA-Z0-9-_]{20,})(?:\?|$)/ // documentId sono lunghi almeno 20 caratteri
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1] && !match[1].includes('create')) {

            return match[1];
          }
        }

        return null;
      };
      
      // Monitora l'URL per aspettare che l'entry sia salvata
      let documentId: string | null = null;
      let attempts = 0;
      const maxAttempts = 30; // 30 tentativi = 60 secondi max

      while (!documentId && attempts < maxAttempts) {
        const currentUrl = window.location.href;
        
        // Se siamo ancora su /create, aspetta
        if (currentUrl.includes('/create')) {

        } else {
          documentId = extractDocumentId(currentUrl);
          if (documentId) {

            break;
          }
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!documentId) {

        return false;
      }
      
      // Ottieni token JWT dal localStorage (Strapi admin)
      let token = localStorage.getItem('jwtToken');
      
      // Se non trovato nel localStorage, prova nei cookie
      if (!token) {
        token = document.cookie
          .split(';')
          .find(c => c.trim().startsWith('jwtToken='))
          ?.split('=')[1];
      }
      
      // Se ancora non trovato, prova a estrarre dal fetch intercepts
      if (!token) {
        const userInfo = localStorage.getItem('strapiUserInfo');
        if (userInfo) {
          try {
            const parsed = JSON.parse(userInfo);
            token = parsed.jwt || parsed.token;
          } catch (e) {

          }
        }
      }
      
      if (!token) {

        return false;
      }

      // Usa l'admin API per Strapi v5
      const endpoints = [
        `/admin/content-manager/collection-types/api::pagina.pagina/${documentId}`,
        `/admin/content-manager/collection-types/pagina/${documentId}`,
        `/content-manager/collection-types/api::pagina.pagina/${documentId}`
      ];
      
      // Prova diversi payload per Strapi v5 admin API
      const payloads = [
        { 
          pagina: { 
            connect: [{ documentId: info.parentDocumentId }] 
          } 
        },
        { 
          pagina: info.parentDocumentId 
        },
        {
          data: { 
            pagina: { 
              connect: [{ documentId: info.parentDocumentId }] 
            } 
          } 
        },
        {
          data: { 
            pagina: info.parentDocumentId 
          } 
        }
      ];
      
      for (const endpoint of endpoints) {
        for (const payload of payloads) {

          try {
            const response = await fetch(`http://localhost:1337${endpoint}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify(payload)
            });

            if (response.ok) {

              // Mostra messaggio di successo
              const message = document.createElement('div');
              message.style.cssText = `
                position: fixed;
                top: 70px;
                right: 10px;
                background: #4CAF50;
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                z-index: 10000;
                font-family: system-ui;
                font-size: 14px;
              `;
              message.textContent = `✅ Relazione "${info.parentLabel}" salvata!`;
              document.body.appendChild(message);
              
              setTimeout(() => {
                message.remove();
                // Ricarica per vedere la relazione
                window.location.reload();
              }, 3000);
              
              return true;
            } else {
              const errorText = await response.text();

            }
            
          } catch (error) {

          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return false;
      
    } catch (error) {

      return false;
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: status === 'success' ? '#4CAF50' : 
                     status === 'error' ? '#f44336' : 
                     status === 'manual' ? '#ff9800' : '#2196F3',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '6px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontSize: '14px',
      maxWidth: '320px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {status === 'loading' && (
        <div>
          ⚙️ Aspettando salvataggio...
          {parentInfo && <div style={{fontSize: '12px', marginTop: '4px', opacity: 0.9}}>
            Parent: {parentInfo.parentLabel}
          </div>}
        </div>
      )}
      {status === 'success' && (
        <div>
          ✅ Relazione forzata!
          <div style={{fontSize: '12px', marginTop: '4px', opacity: 0.9}}>
            Parent: {parentInfo?.parentLabel}
          </div>
        </div>
      )}
      {status === 'manual' && (
        <div>
          ❌ Relazione non salvata
          <div style={{fontSize: '12px', marginTop: '4px', opacity: 0.9}}>
            Vedi console per dettagli
          </div>
        </div>
      )}
      {status === 'error' && (
        <div>❌ Errore</div>
      )}
    </div>
  );
};
