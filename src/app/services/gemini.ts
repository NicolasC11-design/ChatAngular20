import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'

interface PeticionGemini{
  contents: ContentGemini[]; 
  generationConfig?:{
    maxOuputTonkens?: number;
    temperature?: number;
  }
  safetyConfig: SafetySetting[]; 
}

interface ContentGemini{
  role: 'user' | 'model';
  parts: PartGemini[]; 
}

interface PartGemini{
  text: string;
}

interface SafetySetting{
  category: string;
  threshold: string;
}

interface RespuestaGemini{
  candidate:{
    content:{
      parts:{
        text: string;
      }[];
    };
    finishReason: string; 
  }[];
  usageMetaData?:{
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  }
}
@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  // Inyecciones de dependencias

  private http = inject(HttpClient)

  //Variables que llevan la URL
  private apiUrl = environment.gemini.apiUrl
  private apiKey = environment.gemini.apiKey


  enviarMensaje(mensaje: string, historialPrevio: ContentGemini[]= []): Observable<string>{
    //Verificar si la URL esta bien configurada
    if(!this.apiKey || this.apiKey === 'Tu_api_key_de_gemini'){
      console.error('Error la api key no esta configurada');
      return throwError(()=> new Error('Api de gemini no configuarada correctamente'))
    }   

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })

    //Vamos a enviar un mensaje al contenido del sistema
    const mensajesSistema: ContentGemini={
      role: 'user',
      parts: [{
        text: "Eres un asistente virtual util y amigable, responde siempre en español de manera concisa. Eres Especialista en preguntas generales y sobretodo en programacion de software. Manten un tono profesional pero cercano"
      }]
    };

    const respuestaSistema: ContentGemini = {
      role: 'model',
      parts:[{
        text: 'Entendido, soy tu asistente virtual especializado en programacion de software, te contestare en español ¿En que puedo ayudarte?'
      }]
    }
  }
}
