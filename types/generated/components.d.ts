import type { Schema, Struct } from '@strapi/strapi';

export interface CoreFooterBar extends Struct.ComponentSchema {
  collectionName: 'components_core_footer_bars';
  info: {
    displayName: 'footer-bar';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.link', true>;
    logo: Schema.Attribute.Component<'shared.image', false>;
    testoLatoDestro: Schema.Attribute.String;
  };
}

export interface CoreFooterMain extends Struct.ComponentSchema {
  collectionName: 'components_core_footer_mains';
  info: {
    displayName: 'footer-main';
  };
  attributes: {
    immagineSuperiore: Schema.Attribute.Media<'images', true>;
    logo: Schema.Attribute.Component<'shared.image', false>;
  };
}

export interface CoreHeaderMain extends Struct.ComponentSchema {
  collectionName: 'components_core_header_mains';
  info: {
    displayName: 'header-main';
  };
  attributes: {
    immagineDestra: Schema.Attribute.Component<'shared.image', false>;
    immagineDestraMobile: Schema.Attribute.Component<'shared.image', false>;
    immagineSinistra: Schema.Attribute.Component<'shared.image', false>;
    isVisibile: Schema.Attribute.Boolean;
    logo: Schema.Attribute.Component<'shared.image', false>;
  };
}

export interface CoreHeaderTopBar extends Struct.ComponentSchema {
  collectionName: 'components_core_header_top_bars';
  info: {
    displayName: 'header-top-bar';
  };
  attributes: {
    icons: Schema.Attribute.Component<'shared.image', true>;
    isVisibile: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    logo: Schema.Attribute.Component<'shared.image', false>;
  };
}

export interface HomeAccessoRapido extends Struct.ComponentSchema {
  collectionName: 'components_home_accesso_rapidos';
  info: {
    displayName: 'accesso-rapido';
  };
  attributes: {
    immaginiTitolo: Schema.Attribute.Media<'images', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'accesso rapido'>;
    wrapperBottoni: Schema.Attribute.Component<'shared.wrapper-bottoni', true>;
  };
}

export interface HomeNewsMedia extends Struct.ComponentSchema {
  collectionName: 'components_home_news_medias';
  info: {
    displayName: 'news-media';
  };
  attributes: {
    newsMediaBoxes: Schema.Attribute.Component<'shared.news-media-box', true>;
    title: Schema.Attribute.String;
  };
}

export interface ImmagineGalleriaImmagini extends Struct.ComponentSchema {
  collectionName: 'components_immagine_galleria_immaginis';
  info: {
    displayName: 'galleria-immagini';
  };
  attributes: {
    immagini: Schema.Attribute.Media<'images', true>;
  };
}

export interface ImmagineGalleriaImmaginiTesto extends Struct.ComponentSchema {
  collectionName: 'components_immagine_galleria_immagini_testos';
  info: {
    displayName: 'galleria-immagini-testo';
  };
  attributes: {
    immagini: Schema.Attribute.Media<'images', true>;
  };
}

export interface ImmagineSingolaImmagine extends Struct.ComponentSchema {
  collectionName: 'components_immagine_singola_immagines';
  info: {
    displayName: 'singola-immagine';
  };
  attributes: {
    immagine: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedBottone extends Struct.ComponentSchema {
  collectionName: 'components_shared_bottones';
  info: {
    displayName: 'bottone';
  };
  attributes: {
    icona: Schema.Attribute.Media<'images', true>;
    nuovaPagina: Schema.Attribute.Boolean;
    testi: Schema.Attribute.Component<'shared.testo', true>;
    url: Schema.Attribute.String;
  };
}

export interface SharedColonna extends Struct.ComponentSchema {
  collectionName: 'components_layout_colonnas';
  info: {
    displayName: 'colonna';
  };
  attributes: {
    composizioneColonna: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'datainizio',
          'datafine',
          'title',
          'fonte',
          'autore',
          'comune',
          'descrizione',
          'download',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    etichetta: Schema.Attribute.String & Schema.Attribute.Required;
    isCliccabile: Schema.Attribute.Boolean;
    nomeColonna: Schema.Attribute.String;
    tipo: Schema.Attribute.Enumeration<
      ['text', 'date', 'dateTime', 'file', 'dateFrom', 'dateTo']
    >;
  };
}

export interface SharedImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_images';
  info: {
    displayName: 'image';
  };
  attributes: {
    immagine: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    nuovaPagina: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ordine: Schema.Attribute.Integer;
    url: Schema.Attribute.String;
  };
}

export interface SharedInputRicerca extends Struct.ComponentSchema {
  collectionName: 'components_widget_input_ricercas';
  info: {
    displayName: 'input-ricerca';
  };
  attributes: {
    filtro: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'link';
  };
  attributes: {
    etichetta: Schema.Attribute.String & Schema.Attribute.Required;
    nuovaPagina: Schema.Attribute.Boolean;
    url: Schema.Attribute.String;
  };
}

export interface SharedNewsMediaBox extends Struct.ComponentSchema {
  collectionName: 'components_shared_news_media_boxes';
  info: {
    displayName: 'news-media-box';
  };
  attributes: {
    composizioneColonnaDestra: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        ['data', 'title', 'fonte', 'autore', 'comune']
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneColonnaSinistra: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        ['data', 'ora', 'comune', 'contratto', 'ruolo', 'stato']
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: 'openGraph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    focusKeyword: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SharedTabella extends Struct.ComponentSchema {
  collectionName: 'components_layout_tabellas';
  info: {
    displayName: 'tabella';
  };
  attributes: {
    colonne: Schema.Attribute.Component<'shared.colonna', true>;
  };
}

export interface SharedTesto extends Struct.ComponentSchema {
  collectionName: 'components_shared_testos';
  info: {
    displayName: 'testo';
  };
  attributes: {
    testo: Schema.Attribute.String;
  };
}

export interface SharedWrapperBottoni extends Struct.ComponentSchema {
  collectionName: 'components_shared_wrapper_bottonis';
  info: {
    displayName: 'wrapper-bottoni';
  };
  attributes: {
    bottoni: Schema.Attribute.Component<'shared.bottone', true>;
  };
}

export interface UrlUrlAddizionali extends Struct.ComponentSchema {
  collectionName: 'components_url_url_addizionalis';
  info: {
    displayName: 'url-addizionali';
  };
  attributes: {
    path: Schema.Attribute.String;
  };
}

export interface WidgetAllegati extends Struct.ComponentSchema {
  collectionName: 'components_widget_allegatis';
  info: {
    displayName: 'allegati';
  };
  attributes: {
    docs: Schema.Attribute.Media<'files', true>;
    title: Schema.Attribute.String;
  };
}

export interface WidgetAppuntamenti extends Struct.ComponentSchema {
  collectionName: 'components_widget_appuntamentis';
  info: {
    displayName: 'appuntamenti';
  };
  attributes: {
    colonne: Schema.Attribute.Component<'shared.colonna', true> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<
        [
          {
            composizioneColonna: '["dataInizio", "dataFine"]';
            etichetta: 'data';
            isCliccabile: false;
            nomeColonna: 'data';
            tipo: 'text';
          },
          {
            composizioneColonna: '["title"]';
            etichetta: 'title';
            isCliccabile: true;
            nomeColonna: 'title';
            tipo: 'text';
          },
          {
            composizioneColonna: '["comune"]';
            etichetta: 'comune';
            isCliccabile: false;
            nomeColonna: 'luogo';
            tipo: 'text';
          },
        ]
      >;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    title: Schema.Attribute.String;
  };
}

export interface WidgetArchivio extends Struct.ComponentSchema {
  collectionName: 'components_widget_archivios';
  info: {
    displayName: 'archivio';
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface WidgetArticolo extends Struct.ComponentSchema {
  collectionName: 'components_widget_articolos';
  info: {
    displayName: 'articolo';
  };
  attributes: {
    articoli: Schema.Attribute.Relation<'oneToMany', 'api::articoli.articoli'>;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<20>;
  };
}

export interface WidgetComunicati extends Struct.ComponentSchema {
  collectionName: 'components_widget_comunicatis';
  info: {
    displayName: 'comunicati';
  };
  attributes: {
    colonne: Schema.Attribute.Component<'shared.colonna', true> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<
        [
          {
            composizioneColonna: '["data"]';
            etichetta: 'data';
            isCliccabile: false;
            nomeColonna: 'data';
            tipo: 'dateTime';
          },
          {
            composizioneColonna: '["comune","title"]';
            etichetta: 'title';
            isCliccabile: true;
            nomeColonna: 'title';
            tipo: 'text';
          },
          {
            composizioneColonna: '["fonte"]';
            etichetta: 'fonte';
            isCliccabile: false;
            nomeColonna: 'fonte';
            tipo: 'text';
          },
          {
            composizioneColonna: '["descrizione"]';
            etichetta: 'descrizione';
            isCliccabile: false;
            nomeColonna: 'descrizione';
            tipo: 'text';
          },
        ]
      >;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    title: Schema.Attribute.String;
  };
}

export interface WidgetContatti extends Struct.ComponentSchema {
  collectionName: 'components_widget_contattis';
  info: {
    displayName: 'contatti';
  };
  attributes: {
    colonne: Schema.Attribute.Component<'shared.colonna', true> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<
        [
          {
            composizioneColonna: '["title"]';
            etichetta: 'title';
            isCliccabile: false;
            nomeColonna: 'comando';
            tipo: 'text';
          },
          {
            composizioneColonna: '["sede"]';
            etichetta: 'sede';
            isCliccabile: false;
            nomeColonna: 'sede';
            tipo: 'text';
          },
          {
            composizioneColonna: '["telefono","fax"]';
            etichetta: 'telefono e fax';
            isCliccabile: false;
            nomeColonna: 'telefono e fax';
            tipo: 'text';
          },
          {
            composizioneColonna: '["email"]';
            etichetta: 'email';
            isCliccabile: false;
            nomeColonna: 'e-mail';
            tipo: 'text';
          },
          {
            composizioneColonna: '["postaElettronicaCertificata"]';
            etichetta: 'postaElettronicaCertificata';
            isCliccabile: false;
            nomeColonna: 'posta elettronica certificata';
            tipo: 'text';
          },
        ]
      >;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    title: Schema.Attribute.String;
  };
}

export interface WidgetEventi extends Struct.ComponentSchema {
  collectionName: 'components_widget_eventis';
  info: {
    displayName: 'eventi';
  };
  attributes: {
    colonne: Schema.Attribute.Component<'shared.colonna', true> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<
        [
          {
            composizioneColonna: '["data"]';
            etichetta: 'data';
            isCliccabile: false;
            nomeColonna: 'data';
            tipo: 'date';
          },
          {
            composizioneColonna: '["title"]';
            etichetta: 'title';
            isCliccabile: true;
            nomeColonna: 'title';
            tipo: 'text';
          },
          {
            composizioneColonna: '["comune"]';
            etichetta: 'comune';
            isCliccabile: false;
            nomeColonna: 'luogo';
            tipo: 'text';
          },
          {
            composizioneColonna: '["descrizione"]';
            etichetta: 'descrizione';
            isCliccabile: false;
            nomeColonna: 'descrizione';
            tipo: 'text';
          },
        ]
      >;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    title: Schema.Attribute.String;
  };
}

export interface WidgetFiltro extends Struct.ComponentSchema {
  collectionName: 'components_widget_filtros';
  info: {
    displayName: 'filtro';
  };
  attributes: {
    filtri: Schema.Attribute.Component<'shared.input-ricerca', true> &
      Schema.Attribute.Required;
    testo: Schema.Attribute.String;
  };
}

export interface WidgetInfo extends Struct.ComponentSchema {
  collectionName: 'components_widget_infos';
  info: {
    displayName: 'info';
  };
  attributes: {
    testo: Schema.Attribute.String;
  };
}

export interface WidgetMenu extends Struct.ComponentSchema {
  collectionName: 'components_widget_menus';
  info: {
    displayName: 'menu';
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface WidgetNew extends Struct.ComponentSchema {
  collectionName: 'components_widget_news';
  info: {
    displayName: 'news';
  };
  attributes: {
    colonne: Schema.Attribute.Component<'shared.colonna', true> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<
        [
          {
            composizioneColonna: '["data"]';
            etichetta: 'data';
            isCliccabile: false;
            nomeColonna: 'data';
            tipo: 'dateTime';
          },
          {
            composizioneColonna: '["sourceName"]';
            etichetta: 'sourceName';
            isCliccabile: false;
            nomeColonna: 'fonte';
            tipo: 'text';
          },
          {
            composizioneColonna: '["title"]';
            etichetta: 'title';
            isCliccabile: true;
            nomeColonna: 'title';
            tipo: 'text';
          },
          {
            composizioneColonna: '["content"]';
            etichetta: 'content';
            isCliccabile: false;
            nomeColonna: 'descrizione';
            tipo: 'text';
          },
        ]
      >;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    title: Schema.Attribute.String;
  };
}

export interface WidgetOrdineDelGiorno extends Struct.ComponentSchema {
  collectionName: 'components_widget_ordine_del_giornos';
  info: {
    displayName: 'ordine-del-giorno';
  };
  attributes: {
    colonne: Schema.Attribute.Component<'shared.colonna', true> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<
        [
          {
            composizioneColonna: '["data"]';
            etichetta: 'data';
            isCliccabile: false;
            nomeColonna: 'data';
            tipo: 'text';
          },
          {
            composizioneColonna: '["title"]';
            etichetta: 'title';
            isCliccabile: false;
            nomeColonna: 'title';
            tipo: 'text';
          },
          {
            composizioneColonna: '["download"]';
            etichetta: 'download';
            isCliccabile: true;
            nomeColonna: 'download';
            tipo: 'file';
          },
        ]
      >;
    numElementiDaMostrare: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    title: Schema.Attribute.String;
  };
}

export interface WidgetStampaDoc extends Struct.ComponentSchema {
  collectionName: 'components_widget_stampa_docs';
  info: {
    displayName: 'stampa-doc';
  };
  attributes: {
    testo: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'core.footer-bar': CoreFooterBar;
      'core.footer-main': CoreFooterMain;
      'core.header-main': CoreHeaderMain;
      'core.header-top-bar': CoreHeaderTopBar;
      'home.accesso-rapido': HomeAccessoRapido;
      'home.news-media': HomeNewsMedia;
      'immagine.galleria-immagini': ImmagineGalleriaImmagini;
      'immagine.galleria-immagini-testo': ImmagineGalleriaImmaginiTesto;
      'immagine.singola-immagine': ImmagineSingolaImmagine;
      'shared.bottone': SharedBottone;
      'shared.colonna': SharedColonna;
      'shared.image': SharedImage;
      'shared.input-ricerca': SharedInputRicerca;
      'shared.link': SharedLink;
      'shared.news-media-box': SharedNewsMediaBox;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
      'shared.tabella': SharedTabella;
      'shared.testo': SharedTesto;
      'shared.wrapper-bottoni': SharedWrapperBottoni;
      'url.url-addizionali': UrlUrlAddizionali;
      'widget.allegati': WidgetAllegati;
      'widget.appuntamenti': WidgetAppuntamenti;
      'widget.archivio': WidgetArchivio;
      'widget.articolo': WidgetArticolo;
      'widget.comunicati': WidgetComunicati;
      'widget.contatti': WidgetContatti;
      'widget.eventi': WidgetEventi;
      'widget.filtro': WidgetFiltro;
      'widget.info': WidgetInfo;
      'widget.menu': WidgetMenu;
      'widget.new': WidgetNew;
      'widget.ordine-del-giorno': WidgetOrdineDelGiorno;
      'widget.stampa-doc': WidgetStampaDoc;
    }
  }
}
