export interface MensajeChat{
    id: string,
    contenido: string,
    usuarioID: string,
    fechaEnvio: string,
    estado: 'Enviado' |  'Enviando' | 'Error' | 'Temporal'
    tipo: 'Usuario' | 'Asistente'
}

export interface ConversacionChat{
    id: string,
    uid: string,
    mensajes: MensajeChat,
    ultimaActividad: Date,
    FechaCreacion: Date,
    Titulo: string
}