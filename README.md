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

La solución local está contenida utilizando **Docker Compose**, lo que permite gestionar de manera eficiente los diferentes componentes del sistema. Cada servicio (frontend, backend y base de datos) se despliega en un contenedor aislado, garantizando una fácil configuración y portabilidad.

### Arquitectura Local

La arquitectura local se compone de tres principales componentes:

1. **Frontend**: Construido con **Astro**, sirve como la interfaz de usuario para que los estudiantes interactúen con la plataforma.
2. **Backend**: Implementado con **Node.js**, utilizando **Express** y **TypeScript**, gestiona las operaciones del sistema, incluida la autenticación y el manejo de datos.
3. **Base de Datos**: Utiliza **PostgreSQL** para almacenar información de estudiantes, evaluaciones y detalles de los docentes.

### Imágenes Personalizadas

Se utilizaron imágenes personalizadas para el backend y el frontend, por configuraciones específicas y para garantizar que las dependencias necesarias estuvieran presentes en los contenedores.

#### Dockerfile del Frontend:
```dockerfile
FROM node:22.12 AS runtime

WORKDIR /app
COPY . /app

EXPOSE 3000

RUN npm install
RUN npm run build

CMD ["node", "dist/server/entry.mjs"]
```

#### Dockerfile del Backend:
```dockerfile
FROM node:22.12

RUN apt update && apt install -y iputils-ping curl

WORKDIR /app
COPY . /app

EXPOSE 5000

RUN npm install
RUN npm run build

CMD ["npm", "start"]
```

### Configuración con Docker Compose

El archivo `docker-compose.yml` contiene la configuración de los servicios y sus dependencias, así como la configuración de la red interna para permitir la comunicación entre los contenedores.

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
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - backend_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend_app
    restart: always
    dns:
    - 8.8.8.8
    - 4.4.4.4
    working_dir: /app
    volumes: []
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PORT: 5000
      JWT_SECRET: ProyectoFinalInfraestructuraG50
      DATABASE_URL: postgres://admin:admin_password@postgres:5432/glassdoor_db
    networks:
      - backend_network  

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend_app
    restart: always
    ports:
      - "3000:3000" 
    working_dir: /app
    volumes: []
    environment:
      API_BASE_URL: http://backend:5000  
      PORT: 3000
      HOST: 0.0.0.0
    depends_on:
      - backend
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

---

## Solución en la Nube (Minikube)

La solución en la nube se implementó utilizando **Kubernetes** en un clúster de **Minikube**. Se utilizó una configuración similar a la local, pero con ajustes específicos para garantizar la escalabilidad y la disponibilidad de los servicios.

### Despliegue en Kubernetes

Pasos para desplegar la solución en Kubernetes:

Se recomienda utilizar herramientas como **Kompose** para convertir el archivo `docker-compose.yml` en configuraciones de Kubernetes, lo que facilita la creación de manifiestos iniciales. Por ejemplo:

```bash
kompose convert
```

Después de generar los manifiestos, es posible ajustarlos manualmente para cumplir con los requisitos específicos del proyecto, por simplificar la configuración se subieron las imágenes personalizadas a Docker Hub y se utilizaron en los manifiestos de Kubernetes.

### Configuración de los Manifiestos

**Deployment para el Backend** (con 3 réplicas):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: code3743/backend:latest
          ports:
            - containerPort: 5000
          env:
            - name: PORT
              value: "5000"
            - name: JWT_SECRET
              value: ProyectoFinalInfraestructuraG50
            - name: DATABASE_URL
              value: postgres://admin:admin_password@postgres:5432/glassdoor_db
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000
  type: ClusterIP

```

**Deployment para el Frontend**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: code3743/frontend:latest
          ports:
            - containerPort: 3000
          env:
            - name: API_BASE_URL
              value: http://backend:5000
            - name: PORT
              value: "3000"
            - name: HOST
              value: 0.0.0.0
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
  type: NodePort
```

**Deployment para la Base de Datos**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_USER
          value: admin
        - name: POSTGRES_PASSWORD
          value: admin_password
        - name: POSTGRES_DB
          value: glassdoor_db
        volumeMounts:
        - name: init-db-volume
          mountPath: /docker-entrypoint-initdb.d/init-db.sql
          subPath: init-db.sql
      volumes:
      - name: init-db-volume
        configMap:
          name: init-db-sql
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  type: ClusterIPs
```

Manejar pesistencia de datos en Kubernetes:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### Despliegue en Minikube

Para desplegar en Minikube, se utilizan los siguientes comandos:

```bash
minikube start
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-pvc.yaml
```

Para acceder al frontend, se puede utilizar el siguiente comando:

```bash
minikube service frontend
```

Para automatizar el proceso de despliegue, se puede utilizar el script `deploy.sh`:

```bash
sh deploy.sh
```


---

## Seguridad

Una de las principales consideraciones de seguridad en este proyecto fue garantizar que solo el servicio de frontend esté expuesto al exterior. Tanto el archivo `docker-compose.yml` como los manifiestos de Kubernetes fueron configurados específicamente para exponer únicamente el puerto del frontend (3000) al público. 

- **Backend**: El servicio de backend utiliza una red interna en Docker y un tipo de servicio `ClusterIP` en Kubernetes, lo que garantiza que no sea accesible desde fuera del entorno local o del clúster.
- **Base de Datos**: La base de datos PostgreSQL se configura con un servicio `ClusterIP` en Kubernetes, lo que significa que solo los servicios internos pueden acceder a ella. Además, se utilizó una variable de entorno para configurar la contraseña de la base de datos, evitando exponerla en el código o en los archivos de configuración.

---

### Prueba de Estrés

Para probar la escalabilidad y el rendimiento de la solución, se realizaron pruebas de estrés utilizando **Apache Benchmark**, una herramienta de línea de comandos para realizar solicitudes HTTP a un servidor y medir su rendimiento.

#### Ejemplo con Apache Benchmark:

```bash
ab -n 1000 -c 100 http://<minikube-ip>:<backend-service-port>/ruta-api
```
- `-n 1000`: Número total de solicitudes a enviar.
- `-c 100`: Número de solicitudes concurrentes.

---

## Diagrama de Arquitectura

El diagrama de arquitectura muestra la relación entre los diferentes componentes del sistema y cómo interactúan entre sí.

**Arquitectura Local**:
![Arquitectura local](local.png)

**Arquitectura en la Nube**:
![Arquitectura nube](cloud.png)

