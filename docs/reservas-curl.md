# Ejemplos de API: Crear Reserva

Este documento muestra cómo crear una reserva directamente contra la API del backend usando `curl`.

## Obtener token (login)

```bash
curl -X POST "https://backclub.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  --data '{ "email": "<tu_email>", "password": "<tu_password>" }'
```

De la respuesta, copia el valor de `token` y asígnalo a la variable `TOKEN`:

```bash
export TOKEN="<token_de_la_respuesta>"
```

## Crear reserva (payload sugerido)

Incluimos claves en `camelCase` y `snake_case` para máxima compatibilidad. Ajusta `instalacionId`, fechas y horas a tu caso.

```bash
curl -X POST "https://backclub.onrender.com/api/reservas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "instalacionId": 5,
    "instalacion_id": 5,
    "fechaReserva": "2025-11-12",
    "fecha_reserva": "2025-11-12",
    "horaInicio": "14:00:00",
    "hora_inicio": "14:00:00",
    "horaFin": "16:00:00",
    "hora_fin": "16:00:00",
    "cantidadPersonas": 2,
    "cantidad_personas": 2,
    "motivo": "Entrenamiento",
    "observaciones": "Traer pelotas",
    "estado": "pendiente"
  }'
```

### Notas

- Si tu cuenta es de tipo socio, el frontend asigna `usuario_id` automáticamente; la API puede asociar la reserva al usuario del token.
- Posibles respuestas de error: `401` (token inválido), `400` (datos inválidos), `409` (solapamiento de reserva).