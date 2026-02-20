import { Component } from '@angular/core';
import { MensajeChat } from '../../../models/chat';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  nombre: string = "Jhostyn Nicolas Cristiano Beltran"
  email: string = "jostynnicolascristianobeltran@gmail.com"
  mensajes: MensajeChat[] = []
  CargandoHistorial = false
  asistenteEscribiendo = false
  enviandoMensaje = false
  mensajeTexto = ""
  mensajeError = "No se pudo enviar su mensaje";
  
  enviarMensaje(){}
  manejoErrorImagen(){}
  cerrarSesion(){}
  trackByMensaje(index: number, mensaje: MensajeChat){}
  FormatearMensajeAsistente(mensaje: string){}
  
 

  ngOnInit(){
    this.mensajes = this.generarMensajeDemo();
  }

  private generarMensajeDemo():MensajeChat[]{
    const ahora =new Date();

    return [
      {
      id: 'id1',
      contenido: "Hola eres el asistente?",
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioID: 'u1'
    },{
      id: 'id2',
      contenido: "Hola soy tu Asistente",
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Error',
      usuarioID: 'a1'
    },
     {
      id: 'id1',
      contenido: "Ayudame sumando 1 + 1",
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioID: 'u1'
    },{
      id: 'id2',
      contenido: "¡Claro! si sumas 1 + 1 es igual a 2",
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Error',
      usuarioID: 'a1'
    },
         {
      id: 'id1',
      contenido: "De acuerdo, ahora el resultado multiplicalo por 20 ",
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioID: 'u1'
    },{
      id: 'id2',
      contenido: "Al multiplicar 2 por 20 da un resultado de 40",
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Error',
      usuarioID: 'a1'
    },
    ]
    
  }
}