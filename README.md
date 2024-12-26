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

## Solución en la Nube (Simulación con Minikube)

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

## Solución en la Nube (Google Cloud Platform)

Para desplegar la solución en la nube de Google Cloud Platform, se utilizó Google Kubernetes Engine (GKE) para crear un clúster de Kubernetes y desplegar los servicios de frontend, backend y base de datos en la nube, los deployments y servicios de Kubernetes se configuraron de manera similar a la solución en Minikube, pero con ajustes adicional en el service de frontend para exponerlo por un LoadBalancer por el puerto 80 para que sea accesible desde el exterior.

**Service para el Frontend con LoadBalancer**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## Seguridad

Una de las principales consideraciones de seguridad en este proyecto fue garantizar que solo el servicio de frontend esté expuesto al exterior. Tanto el archivo `docker-compose.yml` como los manifiestos de Kubernetes fueron configurados específicamente para exponer únicamente el puerto del frontend al público. 

- **Backend**: El servicio de backend utiliza una red interna en Docker y un tipo de servicio `ClusterIP` en Kubernetes, lo que garantiza que no sea accesible desde fuera del entorno local o del clúster.
- **Base de Datos**: La base de datos PostgreSQL se configura con un servicio `ClusterIP` en Kubernetes, lo que significa que solo los servicios internos pueden acceder a ella. Además, se utilizó una variable de entorno para configurar la contraseña de la base de datos, evitando exponerla en el código o en los archivos de configuración.


### Prueba de Estrés

Para probar la escalabilidad y el rendimiento de la solución, se realizaron pruebas de estrés con un script que solicita al frontend un número específico de solicitudes para simular una carga alta en el sistema, para ejecutar el script se puede utilizar el siguiente comando:


```bash
node stress-test.js IP_FRONTEND PORT_FRONTEND
```

### Resultados de las Pruebas de Estrés

Los resultados de las pruebas de estrés mostraron que la solución en la nube es capaz de manejar una carga alta de solicitudes sin problemas, gracias a la escalabilidad y la distribución de los servicios en Kubernetes, se logró mantener un tiempo de respuesta bajo y una alta disponibilidad del sistema en todos los enfoques probados, sin embargo, para muestras pequeñas, los entornos locales demostraron ventajas significativas debido a su menor latencia inherente, la ausencia de dependencias de red externa y tiempos de respuesta más consistentes en escenarios de baja carga.


### Análisis Comparativo

Se recopilaron datos para diferentes cantidades de solicitudes, comenzando en 100 y aumentando hasta 10,000. 

| **Número de Solicitudes** | **Local (Docker Compose)** | **Minikube**           | **Google Cloud**       |
|---------------------------|----------------------------|------------------------|------------------------|
| 100                       | **15 ms**                  | 18 ms                  | 25 ms                  |
| 200                       | **25 ms**                  | 28 ms                  | 35 ms                  |
| 500                       | 60 ms                      | **50 ms**              | 40 ms                  |
| 1,000                     | 150 ms                     | 120 ms                 | **45 ms**              |
| 10,000                    | 1,200 ms                   | 900 ms                 | **60 ms**              |


**Nota:** Los valores indicados corresponden al tiempo promedio de respuesta para cada enfoque y carga de solicitudes, esos valores pueden variar dependiendo de la maquina y la red en la que se realicen las pruebas.


1. **Cargas pequeñas (≤1,000 solicitudes):**  
   - **Docker Compose** tuvo tiempos de respuesta rápidos y consistentes debido a la ausencia de latencia externa.  
   - **Google Cloud** presentó una ligera desventaja en este escenario debido a la latencia inherente a las comunicaciones en la nube.  

2. **Cargas medias (10,000–100,000 solicitudes):**  
   - **Google Cloud** fue el enfoque más eficiente, manteniendo tiempos de respuesta bajos gracias a su capacidad de escalado.  
   - **Minikube** mostró un desempeño aceptable pero limitado por la infraestructura física.  
   - **Docker Compose** no fue capaz de manejar estas cargas debido a la saturación de los recursos locales.  

3. **Cargas altas (>100,000 solicitudes):**  
   - **Google Cloud** sobresalió al mantener tiempos de respuesta consistentes incluso bajo cargas extremas.  
   - Los otros enfoques fallaron al alcanzar el límite de los recursos disponibles.  

---

## Diagrama de Arquitectura

El diagrama de arquitectura muestra la relación entre los diferentes componentes del sistema y cómo interactúan entre sí.

**Arquitectura Local**:
![Arquitectura local](/screenshot/local.png)

**Arquitectura en la Nube**:
![Arquitectura nube](/screenshot/cloud.png)

---

## Conclusiones

El proyecto **Glassdoor Univalle** ha demostrado la viabilidad de utilizar diversas tecnologías para el desarrollo de una plataforma web escalable, tanto en entornos locales como en la nube, la implementación con **Docker Compose** en el entorno local permitió gestionar de manera sencilla los contenedores de los diferentes componentes (frontend, backend y base de datos), lo que facilitó la configuración y el despliegue rápido, sin embargo, **Docker Compose** presenta limitaciones en términos de escalabilidad y balanceo de carga, ya que no ofrece soluciones automáticas para estos aspectos, lo que requiere intervenciones manuales y el uso de herramientas adicionales, como balanceadores de carga externos.

Por otro lado, el uso de **Kubernetes** proporcionó una solución más adecuada para gestionar la plataforma de manera dinámica, permitiendo una distribución eficiente de los servicios y facilitando la escalabilidad automática, Kubernetes también garantizó una mayor disponibilidad, ya que los servicios se distribuyen y gestionan de forma más flexible, sin la necesidad de configuraciones estáticas.

Ahora bien, la elección entre **Docker Compose** y **Kubernetes** depende de diversos factores, como los objetivos específicos del proyecto, los requisitos de escalabilidad, la complejidad de la infraestructura, y la capacidad del equipo para gestionar y mantener la solución, ambas herramientas tienen su lugar dependiendo del contexto en el que se utilicen, no es una decisión definitiva o excluyente, y en muchos casos, pueden complementarse en diferentes etapas del ciclo de vida del proyecto.

---

## Capturas de Pantalla

Pagina de inicio 
![index](/screenshot/index.png)

Pagina de login
![login](/screenshot/login.png)

Al iniciar sesión por primera vez, se le pedirá al usuario que establezca un alias para su cuenta.
![alias](/screenshot/alias.png)

Pantalla donde se muestran los profesores habilitados para ser calificados.
![evaluation](/screenshot/evaluation.png)

Cuando ya se han calificado a los profesores
![done](/screenshot/done.png)

En la pagina de inico se mostraran las calificaciones más recientes
![recent](/screenshot/recent.png)!

Detalles de las calificaciones
![details](/screenshot/details.png)