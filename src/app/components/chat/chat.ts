import { Component, ViewChild, ElementRef, inject, viewChild, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { MensajeChat } from '../../../models/chat';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ChatService } from '../../services/chat';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked{

  private authService = inject(AuthService)
  private chatService = inject(ChatService)
  private router = inject(Router)

   //Referenciar los contenedores
  @ViewChild('messagesContainer') messagesContainer! : ElementRef
  @ViewChild('mensajeInput') mensajeInput! : ElementRef

  usuario: User | null = null;
  mensajes: MensajeChat[] = []
  CargandoHistorial = false
  asistenteEscribiendo = false  
  enviandoMensaje = false
  mensajeTexto = ""
  mensajeError = "";

  private debeHacerScroll: boolean = false;

  private suscripciones : Subscription[] = []

  private async verificarAutenticacion(): Promise<void>{
    console.log('Ingreso a verificar autenticacion')
    // A la variable usuario le voy a asignar el servicio de auth y la funcion de obtener
    this.usuario = this.authService.obtenerUsuario()

    if(!this.usuario){
      await this.router.navigate(['/auth'])
      throw new Error('Usuario no autenticado')
    }
  }

  private async inicializarChat(): Promise<void>{
    console.log('Ingreso a Inicializar Chat')
    if(!this.usuario){
      return;
    }

    this.CargandoHistorial = true;
    try{
      console.log('antes de el await')
      await this.chatService.InicializarChat(this.usuario.uid)
      console.log('despues de el await')
    }catch (error){
      console.error('Error al Inicializar')
      throw error;
    }finally{
      this.CargandoHistorial = false
    }
  }

  private configurarSuscripciones(): void{
    const subMensajes = this.chatService.mensajes$.subscribe (mensajes =>{
      this.mensajes = mensajes,
      this.debeHacerScroll = true;
    });

    const subMensajesAsis = this.chatService.asistenteRespondiendo$.subscribe( respondiendo =>{
      this.asistenteEscribiendo = respondiendo;
      if(respondiendo){
        this.debeHacerScroll = true
      }
    });

    this.suscripciones.push(subMensajes, subMensajesAsis)
  }
  
  async enviarMensaje(): Promise<void>{
    if(!this.mensajeTexto.trim()){
      return;
    }

    this.mensajeError = "",
    this.enviandoMensaje = true;

    // Guardando el mensaje en la variable texto
    const texto = this.mensajeTexto.trim();
    // Limpiar el input
    this.mensajeTexto = "";

    try{
      await this.chatService.enviarMensaje(texto);
      this.enfocarInput()
    }catch (error: any){
      console.error('Error al enviar el mensaje')

      this.mensajeError = error.message || 'Error al enviar el mensaje'
      this.mensajeTexto = texto;
    } finally{
      this.enviandoMensaje = false;
    }
  }

  manejarTeclaPresionada(evento: KeyboardEvent){
    if(evento.key === "Enter" && !evento.shiftKey){
      evento.preventDefault();
      this.enviarMensaje();
    }
  }

  async cerrarSesion(): Promise<void>{
    try{
      this.chatService.limpiarChat;

      await this.authService.cerrarSesion();
      await this.router.navigate(['/auth']);

    }catch (error){
      console.error('Error al cerrar la sesion desde componente')
      this.mensajeError = "Error al cerrar la sesion"
      throw error;
    }
  }


  private scrollHaciaAbajo():void{
    try{
      const container = this.messagesContainer?.nativeElement
      if(container){
        container.scrollTop = container.scrollHeight
      }
    }catch(error){
      console.error('❌Error al hacer Scroll❌')
    }
  }

  ngAfterViewChecked():void{
    if(this.debeHacerScroll){
      this.scrollHaciaAbajo();
      this.debeHacerScroll = false
    }
  }


  manejoErrorImagen(evento: any): void{
      evento.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9dRC2nJbGZ1uMuta4ALA8VWQezdm5GakJxloNZSGuUw&s"
  }

  trackByMensaje(index: number, mensaje: MensajeChat){
    return mensaje.id || `${mensaje.tipo} - ${mensaje.fechaEnvio.getTime()}`      
  }

  FormatearMensajeAsistente(contenido: string){
    return contenido
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
  }
   
  formatearHora(fecha: Date): string{
    return fecha.toLocaleDateString('es-ES',{
        hour: '2-digit',
        minute: '2-digit'
    });
  } 
 
  async ngOnInit(): Promise<void>{
    try {
      await this.verificarAutenticacion();
      await this.inicializarChat();
      this.configurarSuscripciones();
    } catch (error){
      console.error('Error al inicializar el chat OnInit')
      this.mensajeError = "Error al cargar el chat. Intente recargar la pagina"
      throw error;
    }
  }

  ngOnDestroy(): void{
    this.suscripciones.forEach(sub => sub.unsubscribe());
  }

  private enfocarInput(): void{
    setTimeout(()=>{
      this.mensajeInput.nativeElement.focus();
    }, 100);
  }
}
