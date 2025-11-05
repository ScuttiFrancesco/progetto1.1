import React, { useEffect, useState } from 'react';
import TreeView from '../../components/TreeView';
import pluginId from '../../pluginId';

interface NodeData {
  id: number | string;
  label: string;
  slug?: string; // Aggiungi slug per il content type pagina
  children?: NodeData[];
  hasChildren?: boolean; // Flag per lazy loading
  raw?: any; // Dati originali del nodo
}

interface ContentType {
  uid: string;
  displayName: string;
  kind: string;
  attributes: Record<string, any>;
}

const DEFAULTS = {
  contentType: '',
  parentField: '',
  labelField: '',
};

const App: React.FC = () => {
  const [query, setQuery] = useState(DEFAULTS);
  const [data, setData] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loadingCTs, setLoadingCTs] = useState(true);

  // Fetch available content types
  const fetchContentTypes = async () => {
    try {
      const response = await fetch('/admin/content-manager/content-types');
      
      const responseText = await response.text();
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        // Fallback: solo Pagina
        setContentTypes([
          { uid: 'api::pagina.pagina', displayName: 'Pagina', kind: 'collectionType', attributes: {} },
        ]);
        return;
      }
      
      
      if (result.data) {
        // Filter only collection types (not single types) AND only Pagina
        const collections = result.data.filter((ct: ContentType) => 
          ct.kind === 'collectionType' && ct.uid === 'api::pagina.pagina'
        );
        setContentTypes(collections);
      } else {
        // Fallback
        setContentTypes([
          { uid: 'api::pagina.pagina', displayName: 'Pagina', kind: 'collectionType', attributes: {} },
        ]);
      }
    } catch (err) {

      // Fallback: solo Pagina
      setContentTypes([
        { uid: 'api::pagina.pagina', displayName: 'Pagina', kind: 'collectionType', attributes: {} },
      ]);
    } finally {
      setLoadingCTs(false);
    }
  };

  const fetchTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('contentType', query.contentType);
      params.set('lazyLoad', 'true'); // Abilita lazy loading
      if (query.parentField) params.set('parentField', query.parentField);
      if (query.labelField) params.set('labelField', query.labelField);
      
      const url = `/admin/plugins/tree-view/tree?${params.toString()}`;
      
      const res = await fetch(url);
     
      
      const responseText = await res.text();
      
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${json.message || 'Unknown error'}`);
      }
      
      setData(json.data || []);
    } catch (e: any) {

      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione dedicata per auto-generazione al cambio select
  const fetchTreeForContentType = async (contentType: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('contentType', contentType);
      params.set('lazyLoad', 'true'); // Abilita lazy loading
      // Usa i valori correnti di parentField e labelField se disponibili
      if (query.parentField) params.set('parentField', query.parentField);
      if (query.labelField) params.set('labelField', query.labelField);
      
      const url = `/admin/plugins/tree-view/tree?${params.toString()}`;
      
      const res = await fetch(url);
      const responseText = await res.text();
      
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseErr) {

        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${json.message || 'Unknown error'}`);
      }
      
      setData(json.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per caricare i children on-demand usando l'endpoint custom
  const loadChildren = async (parentId: string | number, nodeData?: any): Promise<NodeData[]> => {
    try {
      // Per il content type pagina, usa l'endpoint custom che richiede lo slug
      if (query.contentType === 'api::pagina.pagina') {
        // Prova a ottenere lo slug dal nodeData
        let slug = nodeData?.slug || nodeData?.raw?.slug;
        
        if (!slug) {
          // Fallback: cerca il nodo nei dati correnti per trovare lo slug
          const findNodeWithSlug = (nodes: NodeData[], targetId: string | number): string | null => {
            for (const node of nodes) {
              if (node.id === targetId) {
                return (node as any).slug || (node as any).raw?.slug;
              }
              if (node.children) {
                const found = findNodeWithSlug(node.children, targetId);
                if (found) return found;
              }
            }
            return null;
          };
          
          slug = findNodeWithSlug(data, parentId);
        }
        
        if (!slug) {

          throw new Error(`Slug non trovato per il nodo ${parentId}`);
        }
        
        const url = `/api/pagina/subtree/${slug}`;
        
        const res = await fetch(url);
        const responseText = await res.text();
        
        let json;
        try {
          json = JSON.parse(responseText);
        } catch (parseErr) {

          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${json.message || 'Unknown error'}`);
        }
        
        // Trasforma i dati nel formato NodeData in modo ricorsivo
        const transformNode = (node: any): NodeData => ({
          id: node.documentId || node.id,
          label: node.title || node.label || `Node ${node.id}`,
          slug: node.slug,
          children: node.children ? node.children.map(transformNode) : undefined,
          hasChildren: node.children && node.children.length > 0,
          raw: node
        });
        
        // Il tuo endpoint restituisce l'intero subtree con la radice
        // Dobbiamo estrarre solo i children dalla risposta e trasformarli ricorsivamente
        const subtreeData = json.data || json;
        const children = subtreeData.children || [];
        
        const transformedChildren = children.map(transformNode);
        
        
        return transformedChildren;
      } else {
        // Per altri content types, usa l'endpoint del plugin originale
        const params = new URLSearchParams();
        params.set('contentType', query.contentType);
        if (query.parentField) params.set('parentField', query.parentField);
        if (query.labelField) params.set('labelField', query.labelField);
        
        const url = `/admin/plugins/tree-view/tree/children/${parentId}?${params.toString()}`;
        
        const res = await fetch(url);
        const responseText = await res.text();
        
        let json;
        try {
          json = JSON.parse(responseText);
        } catch (parseErr) {
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${json.message || 'Unknown error'}`);
        }
        
        return json.data || [];
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const selectedCT = contentTypes.find(ct => ct.uid === query.contentType);

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ margin: 0 }}>Tree View</h2>
      <p style={{ marginTop: 4, color: '#666' }}>Visualizza gerarchie self-reference - L'albero viene generato automaticamente alla selezione</p>
      
      <div style={{ marginTop: '1.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {loadingCTs ? (
            <div>Caricamento content types...</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Content Type:</label>
                <select
                  value={query.contentType}
                  onChange={(e) => {
                    const newContentType = e.target.value;
                    setQuery(q => ({ ...q, contentType: newContentType }));
                    
                    // Auto-genera l'albero quando viene selezionato un content type
                    if (newContentType) {
                      // Usa un piccolo delay per permettere l'aggiornamento dello state
                      setTimeout(() => {
                        fetchTreeForContentType(newContentType);
                      }, 100);
                    } else {
                      // Se deseleziona, pulisci i dati
                      setData([]);
                      setError(null);
                    }
                  }}
                  style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, minWidth: '200px' }}
                >
                  <option value="">Seleziona un content type...</option>
                  {contentTypes.map(ct => (
                    <option key={ct.uid} value={ct.uid}>
                      {ct.displayName} ({ct.uid})
                    </option>
                  ))}
                </select>
              </div>

              {loading && (
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#e3f2fd', 
                  color: '#1565c0', 
                  borderRadius: 4,
                  fontSize: '14px',
                  marginTop: '18px'
                }}>
                  🔄 Generazione albero in corso...
                </div>
              )}
            </>
          )}
        </div>

        {selectedCT && (
          <div style={{ marginTop: 12, padding: 8, background: '#f8f9fa', borderRadius: 4, fontSize: '12px' }}>
            <strong>Campi disponibili:</strong> {Object.keys(selectedCT.attributes).join(', ')}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, color: '#c62626', fontSize: 12, padding: 8, background: '#fff5f5', borderRadius: 4 }}>
            <strong>Errore:</strong> {error}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div>Caricamento albero...</div>
        ) : data.length === 0 ? (
          <div>Nessun nodo trovato. {query.contentType ? 'Prova a verificare che ci siano dati nella collection.' : 'Seleziona un content type per iniziare.'}</div>
        ) : (
          <TreeView 
            data={data} 
            contentType={query.contentType}
            parentField={query.parentField}
            onLoadChildren={loadChildren}
          />
        )}
      </div>
    </div>
  );
};

export default App;

