# Aprende Jugando: definición del producto

## Visión

Aprende Jugando es una aplicación de escritorio offline que reúne juegos educativos para niños de primaria.

Debe permitir que un docente instale o ejecute la aplicación en un computador Windows y pueda utilizarla sin conexión a internet, sin instalar bases de datos, servidores, Node.js ni herramientas adicionales.

La experiencia debe parecer una colección de videojuegos educativos, no un examen tradicional disfrazado.

## Usuarios

### Estudiante

El estudiante puede:

* Seleccionar o utilizar su perfil.
* Acceder a juegos apropiados para su grado.
* Recibir instrucciones visuales y auditivas.
* Completar actividades.
* Ganar estrellas, insignias o recompensas.
* Continuar su progreso en sesiones posteriores.

### Docente

El docente puede:

* Consultar un panel de control.
* Crear y administrar perfiles de estudiantes.
* Consultar actividades disponibles.
* Crear, editar, duplicar, activar y desactivar actividades.
* Seleccionar una plantilla o mecánica de juego.
* Configurar el contenido mediante formularios.
* Consultar progreso básico.
* Exportar e importar contenido y copias de seguridad.

El docente nunca debe editar JSON directamente.

## Funcionamiento offline

Todos los elementos necesarios deben estar incluidos localmente:

* HTML.
* CSS.
* JavaScript.
* Motor de escritorio.
* Base de datos SQLite.
* Imágenes.
* Personajes.
* Sprites.
* Sonidos.
* Música.
* Tipografías.
* Librerías.
* Contenido educativo inicial.

No se deben utilizar CDN ni recursos remotos para ejecutar funciones esenciales.

## Modelo del producto

El sistema separa tres conceptos:

### Contenido educativo

Ejemplos:

* ¿Cuánto es 8 + 5?
* Ordena las etapas de crecimiento de una planta.
* Relaciona cada animal con su hábitat.
* Atrapa únicamente los números pares.

### Mecánica de juego

Ejemplos:

* Selección múltiple.
* Verdadero o falso.
* Ordenamiento.
* Relacionar parejas.
* Memoria.
* Atrapar elementos.
* Carrera.
* Meteoritos matemáticos.
* Laberinto.
* Clasificación.

### Tema visual

Ejemplos:

* Espacio.
* Dinosaurios.
* Océano.
* Detectives.
* Selva.
* Ciudad.
* Superhéroes.

Una misma actividad educativa puede utilizar diferentes mecánicas o temas visuales cuando sean compatibles.

## Tipos de juegos

### Motores configurables

Permiten que el docente cambie el contenido sin programar:

* Selección múltiple.
* Verdadero o falso.
* Ordenar elementos.
* Relacionar parejas.
* Memoria.
* Clasificar elementos.
* Atrapar la respuesta.
* Carrera de respuestas.
* Meteoritos matemáticos.

### Juegos especializados

Requieren lógica propia:

* Trazado de letras y números.
* Reloj y horarios.
* Uso del teclado.
* Laberintos.
* Mapas.
* Balanza.
* Simuladores de tránsito.
* Rompecabezas específicos.

## Panel docente

El panel debe existir desde la primera versión.

En el primer MVP tendrá:

* Vista de inicio con indicadores básicos.
* Banco de actividades funcional.
* Gestión básica de estudiantes.
* Progreso resumido.
* Sección de reportes visual, aunque los gráficos avanzados todavía no estén implementados.

Las funciones no disponibles deben aparecer claramente deshabilitadas o marcadas como futuras.

## Almacenamiento

SQLite es la fuente principal para:

* Estudiantes.
* Actividades creadas por docentes.
* Configuración de las actividades.
* Progreso.
* Sesiones de juego.
* Resultados.
* Logros.
* Configuración persistente.

JSON se utiliza para:

* Contenido inicial.
* Importar paquetes.
* Exportar actividades.
* Intercambiar contenido entre computadores.
* Copias de seguridad legibles.

Los archivos JSON incluidos en la aplicación no deben modificarse directamente después de instalarla.

## Privacidad

Guardar únicamente la información necesaria:

* Identificador.
* Nombre visible o apodo.
* Grado.
* Avatar.
* Progreso.

No solicitar documentos, direcciones, información médica ni fotografías salvo que una función futura tenga una justificación clara y consentimiento adecuado.

## Primera plataforma objetivo

* Windows x64.
* Aplicación Electron.
* Instalador `.exe`.
* Ejecución completamente offline.
* Futuro paquete portable opcional.

## Objetivo de la primera versión

Demostrar el recorrido completo:

1. Abrir la aplicación.
2. Entrar al panel docente.
3. Crear un estudiante.
4. Crear o editar una actividad.
5. Seleccionar un estudiante.
6. Ejecutar el juego.
7. Guardar el resultado.
8. Consultar el progreso desde el panel.
9. Cerrar y abrir la aplicación sin perder los datos.
