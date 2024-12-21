# Informe del Proyecto Final: Glassdoor Univalle

## Introducción

**Glassdoor Univalle** es una plataforma diseñada para que los estudiantes de la Universidad del Valle puedan evaluar a sus profesores en función de sus experiencias en los cursos que han tomado. Este proyecto permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las evaluaciones de los docentes y utiliza técnicas de **web scraping** para obtener información de los profesores habilitados para ser calificados desde un sistema externo. 

### Objetivos del Proyecto

1. Diseñar y desarrollar una plataforma web que permita a los estudiantes calificar a sus profesores.
2. Implementar una arquitectura eficiente que integre un backend, un frontend y una base de datos.
3. Utilizar contenedores Docker para la solución local y escalar la arquitectura en la nube con Kubernetes.
4. Proporcionar un sistema replicable y escalable, con una arquitectura clara y modular.

---

## Solución Local

La solución local está contenida utilizando **Docker Compose**, permitiendo gestionar de manera eficiente los diferentes componentes del sistema. Cada servicio (frontend, backend y base de datos) se despliega en un contenedor aislado, garantizando una fácil configuración y portabilidad.

### Arquitectura Local

La arquitectura local se compone de tres principales componentes:

1. **Frontend**: Construido con **Astro**, sirve la interfaz de usuario para que los estudiantes interactúen con la plataforma.
2. **Backend**: Implementado con **Node.js**, utilizando **Express** y **TypeScript**, se encarga de manejar las operaciones del sistema, incluida la autenticación y el manejo de datos.
3. **Base de Datos**: Utiliza **PostgreSQL** para almacenar información de estudiantes, evaluaciones y detalles de los docentes.

### Configuración de los Contenedores

#### **Frontend**
El contenedor del frontend incluye:
- Puerto: `3000`
- Dependencias instaladas en tiempo de ejecución.
- Conexión con el backend a través de una URL de API.

#### **Backend**
El contenedor del backend incluye:
- Puerto: `5000`
- Dependencias instaladas en tiempo de ejecución.
- Conexión con la base de datos PostgreSQL usando una URL de base de datos.

#### **Base de Datos**
La base de datos PostgreSQL está configurada para ejecutarse en un contenedor con volúmenes persistentes para garantizar que los datos no se pierdan cuando el contenedor se detiene.

### Configuración con Docker Compose

El archivo `docker-compose.yml` define los servicios necesarios y sus configuraciones. Ejemplo:

```yaml
services:
  postgres:
    image: postgres:15
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin_password
      POSTGRES_DB: glassdoor_db
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - backend_network

  backend:
    image: node:20.16
    container_name: backend_app
    restart: always
    ports:
      - "5000:5000"
    working_dir: /app
    volumes:
      - ./backend:/app
    command: /bin/bash -c "npm install && npm run build && npm run start"
    depends_on:
      - postgres
    environment:
      PORT: 5000
      JWT_SECRET: ProyectoFinalInfraestructuraG50
      DATABASE_URL: postgres://admin:admin_password@postgres:5432/glassdoor_db
    networks:
      - backend_network
  frontend:
    image: node:20.16
    container_name: frontend_app
    restart: always
    ports:
      - "3000:3000"
    environment:
      API_BASE_URL: http://backend:5000
      PORT: 3000
      HOST: 0.0.0.0
    volumes:
      - ./frontend:/app
    working_dir: /app
    depends_on:
      - backend
    command: /bin/bash -c "npm install && npm run build && node dist/server/entry.mjs"
    networks:
      - backend_network

volumes:
  postgres-data:

networks:
  backend_network:
    driver: bridge
```

Para ejecutar localmente, se utiliza:

```bash
docker-compose up --build
```

Los servicios estarán disponibles en las siguientes URLs:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## Solución en la Nube

*Esta sección estará completa una vez que el proyecto sea desplegado en la nube.*

### Despliegue en Kubernetes

En la migración a la nube, se utilizará **Kubernetes** para replicar la arquitectura local. Los pasos a seguir incluyen:

1. Convertir el archivo `docker-compose.yml` en configuraciones de Kubernetes utilizando la herramienta **Kompose**:
   ```bash
   kompose convert
   ```

2. Aplicar los archivos generados a un clúster de Kubernetes:
   ```bash
   kubectl apply -f .
   ```

3. Configurar un balanceador de carga para distribuir el tráfico entre las instancias replicadas del backend.

### Configuración de Réplicas

En Kubernetes, se planificará la réplica de los servicios de la siguiente manera:

- **Backend**: 3 réplicas para asegurar alta disponibilidad.
- **Frontend y Base de Datos**: Se desplegarán con una sola instancia inicialmente.

---

## Análisis y Conclusiones

*Sección en progreso. Aquí se incluirá un análisis de rendimiento, escalabilidad, y conclusiones una vez completado el despliegue en la nube.*

---

## Diagrama de Arquitectura

El diagrama de arquitectura muestra la relación entre los diferentes componentes del sistema y cómo interactúan entre sí.

![Diagrama](image.png)

