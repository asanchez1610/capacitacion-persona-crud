import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'persona-form-element/persona-form-element.js';
import 'persona-dm-element/persona-dm-element.js';
import '@lrnwebcomponents/responsive-grid/responsive-grid.js';
import '@vaadin/vaadin-notification/vaadin-notification.js';
import 'persona-list-element/persona-list-element.js';
import '@polymer/font-roboto/roboto.js';
/**
 * @customElement
 * @polymer
 */
class PersonaAppApp extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
    }

    .container {
      width: 1140px;
      margin-right: auto;
      margin-left: auto;
    }

    .content--card {
      box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2), 0 4px 20px 0 rgba(0, 0, 0, 0.19); 
    }

    .app-container {
      border: 1px #e1e1e1 solid;
      border-radius: 5px;
      padding: 15px 20px;
      margin-top: 15px;
      background-color: #f5f5f5;
    }

    @media (min-width: 360px) {
      .container {
        max-width: 360px;
      }
    }
    
    @media (min-width: 576px) {
      .container {
        max-width: 540px;
      }
    }
    
    @media (min-width: 768px) {
      .container {
        max-width: 720px;
      }
    }
    
    @media (min-width: 992px) {
      .container {
        max-width: 960px;
      }
    }
    
    @media (min-width: 1200px) {
      .container {
        max-width: 1140px;
      }
    }
    
    .container-fluid {
      width: 100%;
      padding-right: 15px;
      padding-left: 15px;
      margin-right: auto;
      margin-left: auto;
    }
    
    h2 {
      margin:0px;
      padding:0px;
      font-size: 1.6em;
      color:#333;
      font-weight: normal;
      width:100%;
      text-align:center;
    }
    
    * {
      font-family: Roboto;
    }

  </style>

  <persona-dm-element id ="personaService" ></persona-dm-element>

  <vaadin-notification duration="3000" id = "notification" position="top-center" >
  <template>
    <div>
     [[message]] <b>[[persona.nombres]] [[persona.apellidos]]</b>
    </div>
  </template>
  </vaadin-notification>

  <h2>App Persona Polymer 3</h2>

  <div class = "container app-container">
    <responsive-grid-row>
      <responsive-grid-col xl="3" lg="3" md="4" sm="12" xs="12">
          <persona-form-element id = "formPersona" persona = {{persona}} ></persona-form-element>
      </responsive-grid-col>
      <responsive-grid-col xl="9" lg="9" md="8" sm="12" xs="12">
      <persona-list-element id = "listPersona" personas = "{{personas}}" ></persona-list-element>
      </responsive-grid-col>
    </responsive-grid-row>
  </div>
    `;
  }

  _loadDocumentsType() {
    this.$.personaService.documentsTypeList(
      (xhr) => (this.$.formPersona.set('documentsType', xhr.response)),
      (error) => console.log('Error:', error)
    );
  }

  _loadPersonas() {
    this.$.personaService.find(
      (xhr) => (this.$.listPersona.set('personas', xhr.response.data)),
      (error) => console.log('Error:', error)
    );
  }

  _personaCreate(event) {
    console.log('_personaCreate', event.detail);
    this.persona = event.detail.persona;
    let displayPersona = `${event.detail.persona.nombres} ${event.detail.persona.apellidos}`; 
    if (this.enableUpdate) {
      this.$.personaService.update(
        this.persona._id,
        this.persona,
        (xhr) => {
          this.message = `Se actualizó a, ${displayPersona}`
          this.$.notification.open();
          this._loadPersonas();
          event.detail.fnSuccess(false);
        },
        (error) => console.log('Error:', error)
      );
    } else {
      this.$.personaService.create(
        this.persona,
        (xhr) => {
          this.message = `Se agregó a, ${displayPersona}`
          this.$.notification.open();
          event.detail.fnSuccess(true);
          this._loadPersonas();
        },
        (error) => console.log('Error:', error)
      );
    }
  }

  _personaSelected(event) {
    console.log('event', event);
    this.$.formPersona.set('persona', event.detail.persona);
    if (event.detail.persona) {
      this.$.formPersona.set('actionTitlePersona', 'Actualizar');
      this.enableUpdate = true;
    } else {
      this.$.formPersona.set('actionTitlePersona', 'Nuevo');
      this.enableUpdate = false;
    }
    this.$.formPersona.set('isUpdate',!this.enableUpdate);
  }

  _personaDelete(event) {
    console.log('_personaDelete', event);
    let displayPersona = `${event.detail.persona.nombres} ${event.detail.persona.apellidos}`; 
    this.persona = event.detail.persona;
      this.$.personaService.delete(
        this.persona._id,
        (xhr) => {
          this.message = `Se eliminó a, ${displayPersona}`
          this.$.notification.open();
          this._loadPersonas();
          event.detail.fnSuccess(false);
        },
        (error) => console.log('Error:', error)
      );
  }

  ready() {
    super.ready();
    this.$.formPersona.addEventListener('persona-registro-event', (event)=>this._personaCreate(event));
    this.$.formPersona.addEventListener('persona-eliminar-event', (event)=>this._personaDelete(event));
    this.$.listPersona.addEventListener('persona-selected-event', (event)=>this._personaSelected(event));
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadDocumentsType();
    this._loadPersonas();
  }

  _changePersonaApp(newValue, oldValue){
    console.log('_changePersonaApp',newValue, oldValue);
    this.enableUpdate = (newValue && newValue._id ? true : false)
  }

  static get properties() {
    return {
      persona: {
        type: Object,
        observer: '_changePersonaApp',
        value: {}
      },
      message: String,
      enableUpdate: {
        type: Boolean,
        value: false
      },
      personas: {
        type: Array,
        value: []
      }
    };
  }
}

window.customElements.define('persona-app-app', PersonaAppApp);
