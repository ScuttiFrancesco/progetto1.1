import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAppuntamentiStoriaAppuntamentiStoria
  extends Struct.CollectionTypeSchema {
  collectionName: 'appuntamenti_storias';
  info: {
    displayName: 'Appuntamenti Storia';
    pluralName: 'appuntamenti-storias';
    singularName: 'appuntamenti-storia';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    data: Schema.Attribute.DateTime;
    linkUtili: Schema.Attribute.Component<'shared.link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::appuntamenti-storia.appuntamenti-storia'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    testo: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAppuntamentiAppuntamenti
  extends Struct.CollectionTypeSchema {
  collectionName: 'appuntamentis';
  info: {
    displayName: 'Appuntamenti';
    pluralName: 'appuntamentis';
    singularName: 'appuntamenti';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    allegati_widget: Schema.Attribute.String;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    comune: Schema.Attribute.String;
    contenuto_da_verificare: Schema.Attribute.RichText;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataInizio: Schema.Attribute.DateTime;
    fotoGallery: Schema.Attribute.Component<
      'immagine.galleria-immagini',
      false
    >;
    ignoraDataFine: Schema.Attribute.Boolean;
    inEvidenza: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    listaLink: Schema.Attribute.Component<'shared.link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::appuntamenti.appuntamenti'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiArticoliArticoli extends Struct.CollectionTypeSchema {
  collectionName: 'articolis';
  info: {
    displayName: 'Articoli';
    pluralName: 'articolis';
    singularName: 'articoli';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    allegati_widget: Schema.Attribute.String;
    autore: Schema.Attribute.RichText;
    categoria_silvaes: Schema.Attribute.Relation<
      'manyToMany',
      'api::categoria-silvae.categoria-silvae'
    >;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    data: Schema.Attribute.DateTime & Schema.Attribute.Required;
    fotoGallery: Schema.Attribute.Component<
      'immagine.galleria-immagini',
      false
    >;
    immagineInEvidenza: Schema.Attribute.Media<'images'>;
    immagineInPrimoPiano: Schema.Attribute.Media<'images'>;
    listaLink: Schema.Attribute.Component<'shared.link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::articoli.articoli'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    seo: Schema.Attribute.Component<'shared.seo', false>;
    slug: Schema.Attribute.UID<'title'>;
    sommario_da_verificare: Schema.Attribute.RichText;
    testo: Schema.Attribute.RichText;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAttiAtti extends Struct.CollectionTypeSchema {
  collectionName: 'attis';
  info: {
    displayName: 'Atti';
    pluralName: 'attis';
    singularName: 'atti';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    categoria_attis: Schema.Attribute.Relation<
      'manyToMany',
      'api::categoria-atti.categoria-atti'
    >;
    CIG: Schema.Attribute.Text;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    curriculum_da_verificare: Schema.Attribute.String;
    data: Schema.Attribute.DateTime;
    documento_da_verificare: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::atti.atti'> &
      Schema.Attribute.Private;
    note: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBannerHomeBannerHome extends Struct.CollectionTypeSchema {
  collectionName: 'banner_homes';
  info: {
    displayName: 'Banner Home';
    pluralName: 'banner-homes';
    singularName: 'banner-home';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::banner-home.banner-home'
    > &
      Schema.Attribute.Private;
    ordine: Schema.Attribute.Integer & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    pulsanteScopri_da_verificare: Schema.Attribute.Boolean;
    redirectNewPage: Schema.Attribute.Boolean;
    redirectUrl: Schema.Attribute.String;
    sottotitolo: Schema.Attribute.Text;
    thumb: Schema.Attribute.Media<'images' | 'videos'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String;
    titoloNascosto: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaAttiCategoriaAtti
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_attis';
  info: {
    displayName: 'Categoria Atti';
    pluralName: 'categoria-attis';
    singularName: 'categoria-atti';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    attis: Schema.Attribute.Relation<'manyToMany', 'api::atti.atti'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-atti.categoria-atti'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaBicentenarioCategoriaBicentenario
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_bicentenarios';
  info: {
    displayName: 'Categoria Bicentenario';
    pluralName: 'categoria-bicentenarios';
    singularName: 'categoria-bicentenario';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-bicentenario.categoria-bicentenario'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaCocerCategoriaCocer
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_cocers';
  info: {
    displayName: 'Categoria Cocer';
    pluralName: 'categoria-cocers';
    singularName: 'categoria-cocer';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-cocer.categoria-cocer'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaCoespuCategoriaCoespu
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_coespus';
  info: {
    displayName: 'Categoria Coespu';
    pluralName: 'categoria-coespus';
    singularName: 'categoria-coespu';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-coespu.categoria-coespu'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaComandanteGeneraleCategoriaComandanteGenerale
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_comandante_generales';
  info: {
    displayName: 'Categoria Comandante Generale';
    pluralName: 'categoria-comandante-generales';
    singularName: 'categoria-comandante-generale';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-comandante-generale.categoria-comandante-generale'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaEditoriaCategoriaEditoria
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_editorias';
  info: {
    displayName: 'Categoria Editoria';
    pluralName: 'categoria-editorias';
    singularName: 'categoria-editoria';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-editoria.categoria-editoria'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaExpoMilano2015CategoriaExpoMilano2015
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_expo_milano_2015s';
  info: {
    displayName: 'Categoria Expo Milano 2015';
    pluralName: 'categoria-expo-milano-2015s';
    singularName: 'categoria-expo-milano-2015';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-expo-milano-2015.categoria-expo-milano-2015'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaFaqCategoriaFaq
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_faqs';
  info: {
    displayName: 'Categoria Faq';
    pluralName: 'categoria-faqs';
    singularName: 'categoria-faq';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-faq.categoria-faq'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaGareAppaltoCategoriaGareAppalto
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_gare_appaltos';
  info: {
    displayName: 'Categoria Gare Appalto';
    pluralName: 'categoria-gare-appaltos';
    singularName: 'categoria-gare-appalto';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    gare_appaltos: Schema.Attribute.Relation<
      'manyToMany',
      'api::gare-appalto.gare-appalto'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-gare-appalto.categoria-gare-appalto'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaLeggiCategoriaLeggi
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_leggis';
  info: {
    displayName: 'Categoria Leggi';
    pluralName: 'categoria-leggis';
    singularName: 'categoria-leggi';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-leggi.categoria-leggi'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaMedagliereCategoriaMedagliere
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_medaglieres';
  info: {
    displayName: 'Categoria Medagliere';
    pluralName: 'categoria-medaglieres';
    singularName: 'categoria-medagliere';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-medagliere.categoria-medagliere'
    > &
      Schema.Attribute.Private;
    medaglies: Schema.Attribute.Relation<
      'manyToMany',
      'api::medaglie.medaglie'
    >;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaMuseoStoricoCategoriaMuseoStorico
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_museo_storicos';
  info: {
    displayName: 'Categoria Museo Storico';
    pluralName: 'categoria-museo-storicos';
    singularName: 'categoria-museo-storico';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-museo-storico.categoria-museo-storico'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaNatoSpCoeCategoriaNatoSpCoe
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_nato_sp_coes';
  info: {
    displayName: 'Categoria Nato Sp Coe';
    pluralName: 'categoria-nato-sp-coes';
    singularName: 'categoria-nato-sp-coe';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-nato-sp-coe.categoria-nato-sp-coe'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaNaturaCategoriaNatura
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_naturas';
  info: {
    displayName: 'Categoria Natura';
    pluralName: 'categoria-naturas';
    singularName: 'categoria-natura';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-natura.categoria-natura'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaPubblicazioniCategoriaPubblicazioni
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_pubblicazionis';
  info: {
    displayName: 'Categoria Pubblicazioni';
    pluralName: 'categoria-pubblicazionis';
    singularName: 'categoria-pubblicazioni';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-pubblicazioni.categoria-pubblicazioni'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaSilvaeCategoriaSilvae
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_silvaes';
  info: {
    displayName: 'Categoria Silvae';
    pluralName: 'categoria-silvaes';
    singularName: 'categoria-silvae';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    articolis: Schema.Attribute.Relation<
      'manyToMany',
      'api::articoli.articoli'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-silvae.categoria-silvae'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaSimulazioneConcorsiCategoriaSimulazioneConcorsi
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_simulazione_concorsis';
  info: {
    displayName: 'Categoria Simulazione Concorsi';
    pluralName: 'categoria-simulazione-concorsis';
    singularName: 'categoria-simulazione-concorsi';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-simulazione-concorsi.categoria-simulazione-concorsi'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaSportCategoriaSport
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_sports';
  info: {
    displayName: 'Categoria Sport';
    pluralName: 'categoria-sports';
    singularName: 'categoria-sport';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-sport.categoria-sport'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoriaTwitterCategoriaTwitter
  extends Struct.CollectionTypeSchema {
  collectionName: 'categoria_twitters';
  info: {
    displayName: 'Categoria Twitter';
    pluralName: 'categoria-twitters';
    singularName: 'categoria-twitter';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::categoria-twitter.categoria-twitter'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCommonCommon extends Struct.CollectionTypeSchema {
  collectionName: 'commons';
  info: {
    description: 'Placeholder content-type for common API routes. This should not be used directly.';
    displayName: 'Common (Internal - Do Not Use)';
    pluralName: 'commons';
    singularName: 'common';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::common.common'
    > &
      Schema.Attribute.Private;
    placeholder: Schema.Attribute.String & Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiComunicatiStampaComunicatiStampa
  extends Struct.CollectionTypeSchema {
  collectionName: 'comunicati_stampas';
  info: {
    displayName: 'Comunicati Stampa';
    pluralName: 'comunicati-stampas';
    singularName: 'comunicati-stampa';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    comune: Schema.Attribute.String;
    contenuto_da_verificare: Schema.Attribute.RichText;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    fonte: Schema.Attribute.String;
    fontePrefisso_da_verificare: Schema.Attribute.Enumeration<['ciao']>;
    fotoGallery: Schema.Attribute.Component<
      'immagine.galleria-immagini',
      false
    >;
    listaLink: Schema.Attribute.Component<'shared.link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::comunicati-stampa.comunicati-stampa'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    redirectNewPage: Schema.Attribute.Boolean;
    scadenzaAutomatica: Schema.Attribute.Boolean;
    slug: Schema.Attribute.UID<'title'>;
    thumb: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiComunicazioniCocerComunicazioniCocer
  extends Struct.CollectionTypeSchema {
  collectionName: 'comunicazioni_cocers';
  info: {
    displayName: 'Comunicazioni Cocer';
    pluralName: 'comunicazioni-cocers';
    singularName: 'comunicazioni-cocer';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    allegati_widget: Schema.Attribute.String;
    categoria_da_verificare: Schema.Attribute.String;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    contenuto_da_verificare: Schema.Attribute.RichText;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    fonte_da_verificare: Schema.Attribute.Enumeration<['scelte']>;
    fonteTestoLibero: Schema.Attribute.String;
    fotoGallery: Schema.Attribute.Component<
      'immagine.galleria-immagini',
      false
    >;
    listaLink: Schema.Attribute.Component<'shared.link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::comunicazioni-cocer.comunicazioni-cocer'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiContattiContatti extends Struct.CollectionTypeSchema {
  collectionName: 'contattis';
  info: {
    displayName: 'Contatti';
    pluralName: 'contattis';
    singularName: 'contatti';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    fax: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::contatti.contatti'
    > &
      Schema.Attribute.Private;
    postaElettronicaCertificata: Schema.Attribute.Email;
    publishedAt: Schema.Attribute.DateTime;
    sede: Schema.Attribute.String;
    slug: Schema.Attribute.UID<'title'>;
    telefono: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEntiEnti extends Struct.CollectionTypeSchema {
  collectionName: 'entis';
  info: {
    displayName: 'Enti';
    pluralName: 'entis';
    singularName: 'enti';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    filePrimoTrimestre: Schema.Attribute.String;
    fileQuartoTrimestre: Schema.Attribute.String;
    fileSecondoTrimestre: Schema.Attribute.String;
    fileTerzoTrimestre: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::enti.enti'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEventiEventi extends Struct.CollectionTypeSchema {
  collectionName: 'eventis';
  info: {
    displayName: 'Eventi';
    pluralName: 'eventis';
    singularName: 'eventi';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    allegati_da_widget: Schema.Attribute.String;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    comune: Schema.Attribute.String;
    contenuto: Schema.Attribute.RichText;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataInizio: Schema.Attribute.String;
    eventi_da_verificare: Schema.Attribute.Relation<
      'oneToOne',
      'api::eventi.eventi'
    >;
    fotoGallery: Schema.Attribute.Component<
      'immagine.galleria-immagini',
      false
    >;
    InHome_da_verificare: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::eventi.eventi'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    pulsanteScopri: Schema.Attribute.Boolean;
    redirectNewPage: Schema.Attribute.Boolean;
    redirectUrl: Schema.Attribute.String;
    slug: Schema.Attribute.UID<'title'>;
    sommario_da_verificare: Schema.Attribute.RichText;
    thumb: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titoloNascosto: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFooterFooter extends Struct.SingleTypeSchema {
  collectionName: 'footers';
  info: {
    displayName: 'Footer';
    pluralName: 'footers';
    singularName: 'footer';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    footerBar: Schema.Attribute.Component<'core.footer-bar', false>;
    footerMain: Schema.Attribute.Component<'core.footer-main', false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::footer.footer'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGareAppaltoGareAppalto extends Struct.CollectionTypeSchema {
  collectionName: 'gare_appaltos';
  info: {
    displayName: 'Gare Appalto';
    pluralName: 'gare-appaltos';
    singularName: 'gare-appalto';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    allegati_widget_______: Schema.Attribute.String;
    anno: Schema.Attribute.Integer;
    annullamento: Schema.Attribute.Media<'files'>;
    assegnazione: Schema.Attribute.Media<'files'>;
    atti: Schema.Attribute.Date;
    bando: Schema.Attribute.Media<'files'>;
    categoria_gare_appaltos: Schema.Attribute.Relation<
      'manyToMany',
      'api::categoria-gare-appalto.categoria-gare-appalto'
    >;
    codiceCig: Schema.Attribute.String;
    codiceUnivoco: Schema.Attribute.String;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataScadenza: Schema.Attribute.DateTime;
    descrizione_da_verificare: Schema.Attribute.RichText;
    enteAppaltante_da_verificare: Schema.Attribute.Enumeration<['ciao']>;
    fonte: Schema.Attribute.String;
    fonteLista_da_verificare: Schema.Attribute.Enumeration<['ciao']>;
    idGara: Schema.Attribute.String;
    listaLink: Schema.Attribute.Component<'shared.link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::gare-appalto.gare-appalto'
    > &
      Schema.Attribute.Private;
    oggettoProcedura_da_verificare: Schema.Attribute.Enumeration<['ciao']>;
    protocollo: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    regioniCompetenza_da_verificare: Schema.Attribute.Enumeration<['ciao']>;
    sceltaContraente_da_verificare: Schema.Attribute.Enumeration<['ciao']>;
    slug: Schema.Attribute.UID<'title'>;
    statoPostScadenza_da_verificare: Schema.Attribute.Enumeration<['ciao']>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHeaderHeader extends Struct.SingleTypeSchema {
  collectionName: 'headers';
  info: {
    displayName: 'Header';
    pluralName: 'headers';
    singularName: 'header';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    headerMain: Schema.Attribute.Component<'core.header-main', false>;
    headerTopBar: Schema.Attribute.Component<'core.header-top-bar', false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::header.header'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHomepageHomepage extends Struct.SingleTypeSchema {
  collectionName: 'homepages';
  info: {
    displayName: 'Homepage';
    pluralName: 'homepages';
    singularName: 'homepage';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    home_block: Schema.Attribute.DynamicZone<
      ['home.accesso-rapido', 'home.news-media']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::homepage.homepage'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiInPrimoPianoInPrimoPiano
  extends Struct.CollectionTypeSchema {
  collectionName: 'in_primo_pianos';
  info: {
    displayName: 'In Primo Piano';
    pluralName: 'in-primo-pianos';
    singularName: 'in-primo-piano';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::in-primo-piano.in-primo-piano'
    > &
      Schema.Attribute.Private;
    ordine: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    redirectUrl: Schema.Attribute.String & Schema.Attribute.Required;
    redirectUrlNewPage: Schema.Attribute.Boolean;
    senzaTitolo: Schema.Attribute.String & Schema.Attribute.Required;
    thumb: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiIncarichiVerticeIncarichiVertice
  extends Struct.CollectionTypeSchema {
  collectionName: 'incarichi_vertices';
  info: {
    displayName: 'Incarichi Vertice';
    pluralName: 'incarichi-vertices';
    singularName: 'incarichi-vertice';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    attoDiConferimento: Schema.Attribute.Text;
    cognome: Schema.Attribute.String;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    grado: Schema.Attribute.String;
    incarico: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::incarichi-vertice.incarichi-vertice'
    > &
      Schema.Attribute.Private;
    nome: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    scadenza: Schema.Attribute.Text;
    slug: Schema.Attribute.UID<'title'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    urlDichiarazioniAssenza: Schema.Attribute.Text;
    urlModelloA: Schema.Attribute.Text;
    urlModelloB: Schema.Attribute.Text;
  };
}

export interface ApiMedaglieMedaglie extends Struct.CollectionTypeSchema {
  collectionName: 'medaglies';
  info: {
    displayName: 'Medaglie';
    pluralName: 'medaglies';
    singularName: 'medaglie';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    categoria_medaglieres: Schema.Attribute.Relation<
      'manyToMany',
      'api::categoria-medagliere.categoria-medagliere'
    >;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataConcessione: Schema.Attribute.String;
    dataLuogoFatto: Schema.Attribute.String;
    dataLuogoMorte: Schema.Attribute.String;
    dataLuogoNascita: Schema.Attribute.String;
    grado: Schema.Attribute.String;
    immagini_da_verificare: Schema.Attribute.Text;
    linkUtili: Schema.Attribute.Component<'shared.link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::medaglie.medaglie'
    > &
      Schema.Attribute.Private;
    motivazione: Schema.Attribute.Text;
    note: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNewNew extends Struct.CollectionTypeSchema {
  collectionName: 'news';
  info: {
    displayName: 'New';
    pluralName: 'news';
    singularName: 'new';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    author: Schema.Attribute.String;
    category_da_verificare: Schema.Attribute.Text;
    composizioneSottotitolo: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    composizioneTitle: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'data',
          'dataInizio',
          'dataFine',
          'title',
          'fonte',
          'comune',
          'ruolo',
          'stato',
          'contratto',
          'autore',
        ]
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    content_da_verificare: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dateCreated: Schema.Attribute.DateTime;
    description: Schema.Attribute.String;
    expirationDate: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::new.new'> &
      Schema.Attribute.Private;
    publicationDate: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    sourceName: Schema.Attribute.String;
    status_da_verificare: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    urlName: Schema.Attribute.String;
    version: Schema.Attribute.Integer;
    visible: Schema.Attribute.Boolean;
  };
}

export interface ApiOrdineDelGiornoOrdineDelGiorno
  extends Struct.CollectionTypeSchema {
  collectionName: 'ordine_del_giornos';
  info: {
    displayName: 'Ordine del giorno';
    pluralName: 'ordine-del-giornos';
    singularName: 'ordine-del-giorno';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    data: Schema.Attribute.Date;
    download: Schema.Attribute.Media<'files'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ordine-del-giorno.ordine-del-giorno'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPaginaPagina extends Struct.CollectionTypeSchema {
  collectionName: 'paginas';
  info: {
    displayName: 'Pagina';
    pluralName: 'paginas';
    singularName: 'pagina';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    blocco_centrale: Schema.Attribute.DynamicZone<
      [
        'widget.ordine-del-giorno',
        'widget.new',
        'widget.eventi',
        'widget.comunicati',
        'widget.appuntamenti',
        'immagine.singola-immagine',
        'immagine.galleria-immagini',
        'immagine.galleria-immagini-testo',
        'widget.articolo',
      ]
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::pagina.pagina'
    > &
      Schema.Attribute.Private;
    mostraInMenu: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        ['header', 'footer', 'nessuno']
      > &
      Schema.Attribute.DefaultTo<'["nessuno"]'>;
    ordineVisualizzazioneMenu: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 15;
          min: 1;
        },
        number
      >;
    pagina: Schema.Attribute.Relation<'oneToOne', 'api::pagina.pagina'>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'>;
    spalla_destra: Schema.Attribute.DynamicZone<
      [
        'widget.stampa-doc',
        'widget.menu',
        'widget.info',
        'widget.filtro',
        'widget.archivio',
        'widget.allegati',
      ]
    >;
    spalla_destra_collection_details: Schema.Attribute.DynamicZone<
      [
        'widget.stampa-doc',
        'widget.menu',
        'widget.info',
        'widget.filtro',
        'widget.archivio',
        'widget.allegati',
      ]
    >;
    tipoLayout: Schema.Attribute.Enumeration<['statico', 'wrapper', 'pagina']> &
      Schema.Attribute.DefaultTo<'wrapper'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_addizionali: Schema.Attribute.Component<'url.url-addizionali', true>;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::appuntamenti-storia.appuntamenti-storia': ApiAppuntamentiStoriaAppuntamentiStoria;
      'api::appuntamenti.appuntamenti': ApiAppuntamentiAppuntamenti;
      'api::articoli.articoli': ApiArticoliArticoli;
      'api::atti.atti': ApiAttiAtti;
      'api::banner-home.banner-home': ApiBannerHomeBannerHome;
      'api::categoria-atti.categoria-atti': ApiCategoriaAttiCategoriaAtti;
      'api::categoria-bicentenario.categoria-bicentenario': ApiCategoriaBicentenarioCategoriaBicentenario;
      'api::categoria-cocer.categoria-cocer': ApiCategoriaCocerCategoriaCocer;
      'api::categoria-coespu.categoria-coespu': ApiCategoriaCoespuCategoriaCoespu;
      'api::categoria-comandante-generale.categoria-comandante-generale': ApiCategoriaComandanteGeneraleCategoriaComandanteGenerale;
      'api::categoria-editoria.categoria-editoria': ApiCategoriaEditoriaCategoriaEditoria;
      'api::categoria-expo-milano-2015.categoria-expo-milano-2015': ApiCategoriaExpoMilano2015CategoriaExpoMilano2015;
      'api::categoria-faq.categoria-faq': ApiCategoriaFaqCategoriaFaq;
      'api::categoria-gare-appalto.categoria-gare-appalto': ApiCategoriaGareAppaltoCategoriaGareAppalto;
      'api::categoria-leggi.categoria-leggi': ApiCategoriaLeggiCategoriaLeggi;
      'api::categoria-medagliere.categoria-medagliere': ApiCategoriaMedagliereCategoriaMedagliere;
      'api::categoria-museo-storico.categoria-museo-storico': ApiCategoriaMuseoStoricoCategoriaMuseoStorico;
      'api::categoria-nato-sp-coe.categoria-nato-sp-coe': ApiCategoriaNatoSpCoeCategoriaNatoSpCoe;
      'api::categoria-natura.categoria-natura': ApiCategoriaNaturaCategoriaNatura;
      'api::categoria-pubblicazioni.categoria-pubblicazioni': ApiCategoriaPubblicazioniCategoriaPubblicazioni;
      'api::categoria-silvae.categoria-silvae': ApiCategoriaSilvaeCategoriaSilvae;
      'api::categoria-simulazione-concorsi.categoria-simulazione-concorsi': ApiCategoriaSimulazioneConcorsiCategoriaSimulazioneConcorsi;
      'api::categoria-sport.categoria-sport': ApiCategoriaSportCategoriaSport;
      'api::categoria-twitter.categoria-twitter': ApiCategoriaTwitterCategoriaTwitter;
      'api::common.common': ApiCommonCommon;
      'api::comunicati-stampa.comunicati-stampa': ApiComunicatiStampaComunicatiStampa;
      'api::comunicazioni-cocer.comunicazioni-cocer': ApiComunicazioniCocerComunicazioniCocer;
      'api::contatti.contatti': ApiContattiContatti;
      'api::enti.enti': ApiEntiEnti;
      'api::eventi.eventi': ApiEventiEventi;
      'api::footer.footer': ApiFooterFooter;
      'api::gare-appalto.gare-appalto': ApiGareAppaltoGareAppalto;
      'api::header.header': ApiHeaderHeader;
      'api::homepage.homepage': ApiHomepageHomepage;
      'api::in-primo-piano.in-primo-piano': ApiInPrimoPianoInPrimoPiano;
      'api::incarichi-vertice.incarichi-vertice': ApiIncarichiVerticeIncarichiVertice;
      'api::medaglie.medaglie': ApiMedaglieMedaglie;
      'api::new.new': ApiNewNew;
      'api::ordine-del-giorno.ordine-del-giorno': ApiOrdineDelGiornoOrdineDelGiorno;
      'api::pagina.pagina': ApiPaginaPagina;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
