# CRM Psicología - Sistema de Gestión de Casos Terapéuticos

## Descripción
Sistema CRM para gestión de psicólogas, pacientes y programas terapéuticos con seguimiento de sesiones y detección de desviaciones.

## Requisitos
- Node.js 18+
- XAMPP (MySQL)
- npm

## Instalación

### 1. Configurar Base de Datos
1. Iniciar XAMPP (Apache + MySQL)
2. Abrir phpMyAdmin: http://localhost/phpmyadmin
3. Ejecutar el archivo `sql/schema.sql` para crear la base de datos
4. Ejecutar el archivo `sql/seed.sql` para insertar datos de ejemplo

### 2. Configurar Aplicación
```bash
cd soft/crm/app
npm install
```

### 3. Configurar Variables de Entorno
El archivo `.env.local` ya está configurado para XAMPP:
```
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=crm_psicologia
DATABASE_PORT=3306
```

### 4. Iniciar la Aplicación
```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## Estructura del Proyecto
```
soft/crm/
├── sql/
│   ├── schema.sql      # Esquema de la base de datos
│   └── seed.sql        # Datos de ejemplo
└── app/                # Aplicación Next.js
    └── src/
        ├── app/
        │   ├── page.tsx           # Dashboard principal
        │   ├── pacientes/         # Gestión de pacientes
        │   ├── asignaciones/      # Asignaciones paciente-psicóloga
        │   ├── programas/         # Programas terapéuticos
        │   └── alertas/           # Alertas de desviación
        ├── api/                   # Endpoints API
        │   ├── dashboard/
        │   ├── pacientes/
        │   ├── asignaciones/
        │   ├── sesiones/
        │   ├── programas/
        │   └── alertas/
        └── lib/
            └── db.ts             # Conexión a MySQL
```

## Funcionalidades
- Dashboard con estadísticas generales
- Gestión de pacientes con filtros
- Asignaciones con seguimiento de progreso
- Programas terapéuticos con metas por sesión
- Sistema de alertas por desviaciones
- Registro de sesiones con detección automática de desviaciones

## Usuarios de Ejemplo
- **Líder:** carmen.ruiz@clinica.com
- **Supervisor:** roberto.martin@clinica.com
- **Psicólogas:** ana.garcia@clinica.com, maria.lopez@clinica.com, etc.
- **Contraseña:** password123 (para todos)

## Notas
- La aplicación está configurada para uso local con XAMPP
- La conexión a MySQL es directa (sin ORM)
- Los datos de ejemplo incluyen 20 pacientes, 10 psicólogas, 4 programas y múltiples sesiones
