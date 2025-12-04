# Estructura de Módulos y Entidades

Esta guía define cómo organizar los módulos en NestJS basándose en el tipo de tabla del ERD.

| Tipo de Tabla (Tu ERD) | Recomendación de Módulo en NestJS |
| :--- | :--- |
| **Entidades Centrales/Raíces Agregadas**<br>Ejemplos: `PERSONA`, `NNA`, `PROCESO_JUDICIAL`. | **Crea un Módulo dedicado con su propio Controller y Service.**<br>Ejemplos: `PersonModule`, `NnaModule`, `ProcesoJudicialModule`. |
| **Tablas de Relación o de Configuración**<br>Ejemplos: `REGIMEN_VISITAS`, `OBLIGACION_ALIMENTARIA`, `SENTENCIA` (depende del `PROCESO_JUDICIAL`). | **Inclúyelas dentro del Módulo principal al que pertenecen.**<br>Inclúyelas como providers (repositorios/servicios) dentro de `ProcesoJudicialModule` o en su propio servicio si son muy complejos. |
| **Tablas Comunes/Compartidas**<br>Ejemplos: `PARTE_PROCESO` (si solo es una tabla de unión), `AUTORIDAD_PARENTAL` (si es solo para `NNA`). | **Inclúyelas en un módulo de compartición o common.**<br>El módulo `CommonModule` o inclúyelas directamente en el módulo más coherente (`NnaModule` o `ProcesoJudicialModule`). |
