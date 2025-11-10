# Uso: edita email/password y payload, luego ejecuta este script en PowerShell.

# 1) Login y obtención de token
$email = "<tu_email>"
$password = "<tu_password>"

$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Method Post -Uri "https://backclub.onrender.com/api/auth/login" -ContentType "application/json" -Body $loginBody
$token = $loginRes.token
Write-Host "Token obtenido: $token"

# 2) Payload de creación de reserva (ajusta valores)
$payload = @{
  instalacionId = 5
  instalacion_id = 5
  fechaReserva = "2025-11-12"
  fecha_reserva = "2025-11-12"
  horaInicio = "14:00:00"
  hora_inicio = "14:00:00"
  horaFin = "16:00:00"
  hora_fin = "16:00:00"
  cantidadPersonas = 2
  cantidad_personas = 2
  motivo = "Entrenamiento"
  observaciones = "Traer pelotas"
  estado = "pendiente"
} | ConvertTo-Json

# 3) POST de creación
$headers = @{ Authorization = "Bearer $token" }
$createRes = Invoke-RestMethod -Method Post -Uri "https://backclub.onrender.com/api/reservas" -Headers $headers -ContentType "application/json" -Body $payload

Write-Host "Reserva creada:" ( $createRes | ConvertTo-Json -Depth 6 )