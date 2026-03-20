import { inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { map } from 'rxjs';
import { Usuario } from '../../models/usuario';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private auth = inject(Auth)

  //Variable de tipo observable
  usuario$ = user(this.auth)

  //Variable observable que devuelve true o false si el usuario esta autenticado
  estaAutenticado$ = this.usuario$.pipe(
    map(usuario => !!usuario)
  )

  //Funcion asincrona que permite el inicio de sesion
  async iniciarsesion(): Promise< Usuario | null>{
    try{
      console.log('Inicio la funcion Iniciar Sesion')
      const proveedor = new GoogleAuthProvider;

      //Controladores 
      proveedor.addScope('email')
      proveedor.addScope('profile')

      console.log('Antes')
      const resultado = await signInWithPopup(this.auth, proveedor)
      console.log('Despues')
      
      const usuarioFirebase = resultado.user;

      if(usuarioFirebase){
        const usuario: Usuario = {
          uid: usuarioFirebase.uid,
          nombre: usuarioFirebase.displayName || 'Usuario sin Nombre',
          email: usuarioFirebase.email || '',
          fotoUrl: usuarioFirebase.photoURL || undefined, 
          fechaCreacion: new Date,
          ultimaConexion: new Date
        }
        return usuario;
      }
      return null;
    }catch(error){ 
      console.error('❌ Error en la autenticacion ❌')
      throw error
    }
  } 
  obtenerUsuario(): User | null{
    return this.auth.currentUser
  }

  //CerrarSesion
  async cerrarSesion(): Promise<void>{
    try{
      await signOut(this.auth)
    } catch (error){
      console.error('Error cerrando sesion', error)
      throw error;
    }
  }
}
