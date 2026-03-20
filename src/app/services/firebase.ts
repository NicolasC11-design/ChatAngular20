import { Injectable, Query, inject } from '@angular/core';
import { Firestore, Timestamp , addDoc, collection, query, where, onSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { DocumentData } from '@angular/fire/compat/firestore';
import { ConversacionChat, MensajeChat } from '../../models/chat'
import { Observable, map } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private firestore = inject(Firestore)

  //Funcion para guardar el mensaje.
  async guardarMensaje(mensaje: MensajeChat): Promise<void>{
    console.log('mensaje', mensaje);
    try{
      console.log('Ingreso a guardar el mensaje')
      // Revisar si viene sin usuarioId
      if(!mensaje.usuarioID){
        // Devuelvo que el mensaje debe tener un usuario ID
        throw new Error('Usuario ID es requerido');
      }else if(!mensaje.contenido){
        throw new Error('EL contenido es requerido');
      }else if(!mensaje.tipo){
        throw new Error('El tipo es es requerido');
      }

      const coleccionMensajes = collection(this.firestore, 'mensajes') 
      // Preparar el mensaje
      const mensajeGuardar = {
        usuarioID : mensaje.usuarioID,  
        contenido : mensaje.contenido,
        tipo: mensaje.tipo,
        estado: mensaje.estado,
        // Fecha es tipo timestamp y necesito pasarla a DATE
        fechaEnvio: Timestamp.fromDate(mensaje.fechaEnvio)
      };
      
      // Añadir el mensaje a la coleccion, generar un documento a la coleccion
      const docref = await addDoc(coleccionMensajes, mensajeGuardar)

    }catch(error: any){
      console.error('❌ error al guardar el mensaje en firestore')
      console.error('Error details', {
        mensaje: error.mensaje,
        code: error.code,
        stack: error.stack
      })
    }
  }
  // Filtrar que los mensajes que se muestran sean los mensajes del usuario autenticado
  obtenerMensajeUsuario(usuarioID: string): Observable<MensajeChat[]>{
    return new Observable ( observer =>{

      const consulta = query(
        collection(this.firestore, 'mensajes'),
        where('usuarioID', "==", usuarioID)
      )

      // Configurar el listener para que funcione en tiempo real snapshot
      console.log('inicio')
      const unSubscribe = onSnapshot(
        consulta,
        (snapshot: QuerySnapshot<DocumentData>)=>{
          const mensajes: MensajeChat[] = snapshot.docs.map( doc =>{
            const data = doc.data();
            return{
              id: doc.id,
              usuarioID: data['usuarioID'], 
              contenido: data['contenido'],
              estado: data['estado'],
              tipo: data['tipo'],
              // Recordemos que firebase guarda TIMESTAMP y angular guarda Date Conversion
              fechaEnvio: data['fechaEnvio'].toDate()
            } as MensajeChat;
          });

          //Ordenar los mensajes desde el mas reciente  al mas antiguo
          mensajes.sort((a, b) => a.fechaEnvio.getTime() - b.fechaEnvio.getTime())

          observer.next(mensajes);
        },
        error =>{
          console.error('Error al escuchar los mensajes');
          observer.error(error);
        }
      );
      console.log('fin')
      // Se retorna una desubscripcion al servicio
      return ()=>unSubscribe()
      
    });
  
    // Gestionar obtener el id del usuario por medio de un mensaje
  }


  // Guardar la conversacion
  async guardarConversacion(conversacion: ConversacionChat): Promise<void>{
    try{
      const collecionConversaciones = collection(this.firestore, 'conversaciones');
      // Preparar las conversaciones para enviarlas a firestore
      const conversacionParaGuardar = {
        ...conversacion,
        FechaCreacion: Timestamp.fromDate(conversacion.FechaCreacion),
        ultimaActividad: Timestamp.fromDate(conversacion.ultimaActividad),
        // Conversion de la fechaEnvio del MensajeChat
        mensajes: conversacion.mensajes.map( mensaje => ({
          ...mensaje,
          fechaEnvio: Timestamp.fromDate(mensaje.fechaEnvio)
        }))
      };
      await addDoc(collecionConversaciones, conversacionParaGuardar);

    }catch(error){
      console.error('Error al guardar la conversacion', error)
      throw error
    }
  }
}
 