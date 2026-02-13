import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  autenticando = false
  mensajeError = "El usuario no existe"
  iniciarSesionConGoogle(){
  }
  
}
