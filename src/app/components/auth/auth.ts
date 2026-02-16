import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.html',
  styleUrl: './auth.css',

})
export class Auth {

  autenticando = false
  mensajeError = ""
  
  //inyeccion de dependencias
  private authService = inject(AuthService)
  private router = inject (Router)

  //funcion que revisa la autenticacion - asincrona

  async iniciarSesionConGoogle() { Promise<void> 
    {
      this.autenticando = true
      this.mensajeError=""

      try {
        //Falta implementar el servicio.

        //Vamos a simular un usuario ya creado

        let usuario = null
        usuario = await new Promise ((resolve) =>{
          setTimeout(()=>resolve({nombre:'usuario de prueba'}), 1000)
        })

        if(usuario){
          await this.router.navigate(['/chat'])
        }else{
          console.log("try despues if")
          this.mensajeError = "Error al autenticar"
          console.error("Error al autenticar en try")
        }  

      } catch (error: any) {

        //Validaciones de algunos posibles errores
        if (error.code === "auth/popup-closed-by-user"){
          console.error('Error: Cerraste la ventana emergente')
        } else if(error.code === "auth/popup-blocked"){
          console.error('El navegador bloqueo la ventana emergente')
        } else if(error.code === "auth/network-request-failed"){
          console.error('Problemas con la conexion a internet')
        } 

      } finally {
        this.autenticando = false
      }
    }
  }
}

/* Verificar que si el usuario ya esta autenticado se redirrecione al chat de una vez*/

/*ngOninit(){
  this.router.navigate(['/chat'])
}
  */


