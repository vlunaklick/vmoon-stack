# Especialidades

Una especialidad agrega conocimientos de un área, por ejemplo frontend. Su workflow coordina las skills de esa área; vstack conserva los pasos generales de implementación y verificación.

```text
specialties/
  frontend/
    frontend-workflow/SKILL.md
    frontend-design/SKILL.md
    frontend-animation/SKILL.md
  otra-especialidad/
    otra-especialidad-workflow/SKILL.md
```

Solo `frontend-workflow` viene incluido inicialmente. Los otros nombres del ejemplo muestran dónde podés copiar skills.

Cada carpeta de skill contiene su `SKILL.md`, referencias y scripts. El `name` debe coincidir con la carpeta y ser único en toda la colección. Para que aparezca como punto de entrada en el índice, nombrá el coordinador con el sufijo `-workflow`. Su `description` explica cuándo usarlo.

Después de copiar, borrar o renombrar skills, ejecutá `./kix sync`. Actualiza `INDEX.md` y los enlaces de instalación. Las skills auxiliares también se instalan, pero no se cargan completas al leer el índice.

No edites `INDEX.md` a mano. Es un catálogo generado a partir de los workflows presentes. Los archivos de skills sí se editan en esta carpeta; no hay copias por plataforma.
