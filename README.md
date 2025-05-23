# Prueba Backend Engineer – Tyba

## Enunciado

1. Deberás desarrollar una API REST con las siguientes funcionalidades:

   - Registro de usuario.
   - Inicio de sesión de usuario.
   - Crear un endpoint para los usuarios autenticados que reciba una ciudad (o coordenadas) y retorne una lista de restaurantes cercanos. Puedes utilizar alguna API pública para esto.
   - Crear un endpoint para consultar el historial de transacciones realizadas.
   - Cierre de sesión del usuario.

2. **Bono:** Se otorgarán puntos adicionales si todo se puede ejecutar localmente utilizando Docker y Docker Compose.

### Recomendaciones adicionales

Recuerda seguir las mejores prácticas de ingeniería. Prestamos especial atención a lo siguiente:

- Pruebas automatizadas.
- Que no haya secretos expuestos en el código.
- Autenticación segura.
- Código bien estructurado, legible y con comentarios.

---

## Requisitos tecnológicos

- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-started/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## Cómo ejecutar

1. [Clona el repositorio](https://github.com/Sofiav014/api-restaurants-nearby.git)

2. Ubícate en la carpeta raíz del proyecto

3. Crea un archivo `.env` con las siguientes variables:

   ```shell
   DB_HOST=
   DB_PORT=
   POSTGRES_USER=
   POSTGRES_PASSWORD=
   POSTGRES_DB=

   REDIS_HOST=
   REDIS_PORT=
   REDIS_PASSWORD=

   MAPS_PLATFORM_API_KEY=
   PLACES_API_URL=
   GEOCODING_API_URL=

   JWT_SECRET=
   JWT_EXPIRES_IN=
   ```

> [!NOTE]  
> Los valores seran enviados por correo

5. Ejecuta el siguiente comando

   ```shell
   docker compose up -d
   ```

6. El servicio estará disponible en la siguiente URL: http://localhost:3000/api

7. Para detener el servicio, ejecuta el siguiente comando:

   ```shell
   docker compose down
   ```

## APIs externas utilizadas

Se creó un proyecto en GCP para obtener la API Key de Google Places API.

Se utilizaron los siguientes endpoints:

- [Geocoding API](https://developers.google.com/maps/documentation/geocoding/requests-geocoding#request): para obtener las coordenadas de la ciudad ingresada.

- [Places API – Nearby Search](https://developers.google.com/maps/documentation/places/web-service/nearby-search#SearchNearbyRequests): para obtener los restaurantes cercanos, según las coordenadas dadas o calculadas.

## Ejecutar Pruebas

### Pruebas Unitarias (jest)

Para ejecutar las pruebas unitarias, se debe ejecutar el siguiente comando:

```shell
cd api #si no estabas en la carpeta
npm run test
```

Si se quiere ejecutar las pruebas y saber su cobertura, se debe ejecutar el siguiente comando:

```shell
npm run test:cov
```

### Pruebas de Postman

Puedes descargar la colección que se encuentra en `api/collections/Prueba_Backend_Engineer_Tyba.postman_collection.json` y ejecutarla manualmente en tu aplicación de Postman.

> [!IMPORTANT]  
> Si la variable de entorno `baseUrl` no está inicializada, inicializala con `http://localhost:3000/api/v1`

También las puedes ejecutar con el siguiente comando:

```shell
npm run test:newman
```

## Documentación Adicional

Puedes encontrarla en la [wiki](https://github.com/Sofiav014/api-restaurants-nearby/wiki) del repositorio.