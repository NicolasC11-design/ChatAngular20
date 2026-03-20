import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'

interface PeticionGemini{
  contents: ContentGemini[];
  generationConfig?:{
    maxOutputTokens?: number;
    temperature?: number; 
  }
  safetySettings: SafetySetting[];
}

interface ContentGemini{
  role: 'user' | 'model';
  parts: PartGemini[];
}

interface PartGemini{
  text : string;
}

interface SafetySetting{
  category: string;
  threshold: string;
}

interface RespuestaGemini{
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
  usageMetaData?:{
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

@Injectable({
  providedIn: 'root',
})


export class GeminiService {
  //inyecciones de dependencias

  private http = inject(HttpClient)

  //Variables que llevan la URL
  private apiURL = environment.gemini.apiUrl
  private apiKey = environment.gemini.apiKey

  enviarMensaje(mensaje: string, historialPrevio: ContentGemini[]=[]): Observable<string>{
    //Verificar si la url esta bien configurada 
    if(!this.apiKey || this.apiKey === 'tu_api_key_gemini'){
      console.error('Error la api key no esta configurada correctamente')
      return throwError(()=> new Error('Api key no configurada'))
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'

      
    })
    //Vamos a enviar un mensaje al contendio del sistema
    const  mensajeSistema: ContentGemini={
      role : 'user',
      parts : [{
        text: "Eres un asistente virtual y amigable., Responde siempre en español de manera consisa, Eres especialista en preguntas generales y sobretodo en progamacion de software. Manten un tono profesional pero cercano"
      }]
    };


    const respuestaSistema: ContentGemini = {
      role : 'model',
      parts:[{
        text: 'Entendido, soy tu asistente virtual especializado en programacion de software, te contestare en español ¿En que puedo ayudarte?'
      }]
    }

    const contenido: ContentGemini[]=[
    mensajeSistema,
    respuestaSistema,
    // Traer el historial previo
    ...historialPrevio,
    {
      role: 'user',
      parts: [{text: mensaje}],
    }
  ];
  const configuracionesDeSeguridad: SafetySetting[]=[
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
  ];

  const cuerpoPeticion: PeticionGemini={
    contents: contenido,
    generationConfig:{
      maxOutputTokens:800,
      temperature:0.7
    },
    safetySettings: configuracionesDeSeguridad
  };

  // Vamos a generar la url completa
  const urlCompleta = `${this.apiURL}?key=${this.apiKey}`

  // Hacer la peticion a HTTP
  return this.http.post<RespuestaGemini>(urlCompleta,cuerpoPeticion,{headers})
  .pipe(
    map(respuesta => {
      // Vamos a revisar que la respuesta tenga un formato correcto
      if(respuesta.candidates && respuesta.candidates.length>0){
        const candidate = respuesta.candidates[0];
        if(candidate.content && candidate.content.parts && candidate.content.parts.length>0){
          let contenidoRespuesta = candidate.content.parts[0].text;

          // Validacion por si la respuesta es erronea por el limite de tokens

          if (candidate.finishReason === "MAX_TOKENS"){
            contenidoRespuesta += "\n\n[nota: Respuesta truncada por el limite de tokens, puedes pedirme que continue de nuevo]"
          }
          return contenidoRespuesta;
        }else{
          throw new Error('Respuesta no contiene un formato valido');
        }
      }else
        throw new Error('Respuesta no contiene un formato esperado')
    }),
    catchError(error =>{
      console.log("Error al comunicarse con gemini")
      let mensajeError = 'Error al conectarse con gemini'

      if(error.status === 400){
        mensajeError = "Peticion invalida a gemini, verifique la configuracion"
      }else if(error.status === 403){
        mensajeError = "Error clave de api no valida o sin permisos"
      }else if(error.status === 429){
        mensajeError = "Has excedido el limite de peticiones gratuitas a gemini, intenta de nuevo en otro momento"
      }else if(error.status === 500){
        mensajeError = "Error con el servidor de gemini"
      }
      return throwError(()=> new Error(mensajeError));
    })
  )

  }

  // Funcion para convertir al formato de gemini
  convertirHistorialGemini(mensaje: any[]): ContentGemini[]{
    const HistorialConvertido : ContentGemini[] = mensaje.map(msg => (
      {
      role: (msg.tipo === 'usuario' ? 'user' : 'model') as 'user' | 'model',
      parts:[{text : msg.contenido}]
      }
    ));

    if (HistorialConvertido.length>8){
      const ultimosMensajes = HistorialConvertido.slice(-8)

      if (ultimosMensajes.length >0 && ultimosMensajes[0].role === 'model'){
        return ultimosMensajes.slice(1);

      }
      return ultimosMensajes;
    }
    return HistorialConvertido;        
  }
  verificarConfiguracion():boolean{
    const configuracionValida = !!(this.apiKey && this.apiKey !== "tu_api_key_gemini" && this.apiURL);
    return configuracionValida;
  }
}