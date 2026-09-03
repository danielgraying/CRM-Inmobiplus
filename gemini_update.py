import os
import re
import google.generativeai as genai

# 1. Configurar Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# 2. Capturar datos del Issue
issue_title = os.environ.get("ISSUE_TITLE", "")
prompt_usuario = os.environ.get("ISSUE_BODY", "")

# 3. Detectar qué archivo quieres modificar leyendo el título [archivo]
# Busca algo como [index.html], [styles.css] o [script.js]
match = re.search(r'\[(.*?\..*?)\]', issue_title)

if not match:
    print("❌ Error: No especificaste el archivo entre corchetes en el título. Ej: [Gemini-Auto][index.html]")
    exit(1)

archivo_objetivo = match.group(1).strip()

# 4. Verificar si el archivo existe en tu proyecto
if not os.path.exists(archivo_objetivo):
    print(f"❌ Error: El archivo '{archivo_objetivo}' no existe en tu repositorio.")
    exit(1)

# 5. Leer el contenido actual de TU archivo (Index, styles o script)
with open(archivo_objetivo, "r", encoding="utf-8") as file:
    codigo_actual = file.read()

# 6. Diseñar las instrucciones estrictas para el modelo
prompt_final = (
    f"Instrucción del usuario: {prompt_usuario}\n\n"
    f"Código actual en el archivo '{archivo_objetivo}':\n"
    f"```\n{codigo_actual}\n```\n\n"
    f"Tu tarea es aplicar el cambio solicitado. Devuelve ÚNICAMENTE el código completo resultante para este archivo. "
    f"No agregues saludos, explicaciones, ni introducciones. No uses bloques de formato markdown (como ```html o ```css) en tu respuesta. "
    f"Devuelve solo el texto limpio listo para guardar."
)

# 7. Ejecutar Gemini 1.5 Flash (Gratuito)
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content(prompt_final)
nuevo_codigo = response.text

# 8. Limpieza de seguridad por si Gemini añade marcas markdown
nuevo_codigo = re.sub(r'^```[a-zA-Z]*\n', '', nuevo_codigo)
nuevo_codigo = re.sub(r'\n```$', '', nuevo_codigo)

# 9. Sobrescribir TU archivo con los cambios aplicados
with open(archivo_objetivo, "w", encoding="utf-8") as file:
    file.write(nuevo_codigo.strip())

print(f"¡Archivo '{archivo_objetivo}' actualizado con éxito por Gemini!")
