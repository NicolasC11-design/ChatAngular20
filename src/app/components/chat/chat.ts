import { Component } from '@angular/core';
import { MensajeChat } from '../../../models/chat';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  nombre: string = "Jhostyn Nicolas Cristiano Beltran"
  email: string = "jostynnicolascristianobeltran@gmail.com"

  mensajes: MensajeChat[] = []
  CargandoHistorial = null

  manejoErrorImagen(){

  }
  cerrarSesion(){

  }
}
