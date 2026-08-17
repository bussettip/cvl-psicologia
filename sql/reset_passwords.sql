-- Resetear contraseñas de todos los usuarios a 'password123'
-- Ejecutar en el contenedor MySQL: docker exec -i cvl-psicologia-db-2 mysql -u root -p'CVLpsicologia2026!' cvl_psicologia < reset_passwords.sql
UPDATE usuarios SET password_hash = '$2b$10$JPb3Q3IXqL0hjve1Ux23zOiPTwwudWYh3O9QX6rQBEGkBOpNjMYJ2';
SELECT id, email, nombre, apellido, rol FROM usuarios;
