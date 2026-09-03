import os
import re
import google.generativeai as genai

# 1. Configurar Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# 2. Capturar el prompt enviado desde el Issue
prompt_usuario = os.environ.get("ISSUE_BODY", "Optimiza el código.")
archivo_objetivo = "app.py"  # El archivo que Gemini va a modificar

# 3. Leer tu código actual (crea el archivo vacío si no existe)
if not os.path.exists(archivo_objetivo):
    with open(archivo_objetivo, "w") as f:
        f.write("# Tu código inicial aquí\n")

with open(archivo_objetivo, "r") as file:
    codigo_actual = file.read()

# 4. Diseñar las instrucciones estrictas para el modelo
prompt_final = (
    f"Instrucción del usuario: {prompt_usuario}\n\n"
    f"Código actual en el archivo:\n"
    f"```\n{codigo_actual}\n```\n\n"
    f"Tu tarea es aplicar el cambio solicitado. Devuelve ÚNICAMENTE el código completo resultante. "
    f"No agregues saludos, explicaciones, ni introducciones. No uses bloques de formato markdown (como ```python) en tu respuesta. "
    f"Devuelve solo texto plano listo para ejecutar."
)

# 5. Ejecutar Gemini (Usamos gemini-1.5-flash que es rápido y gratuito)
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content(prompt_final)
nuevo_codigo = response.text

# 6. Limpieza de seguridad por si Gemini ignora la orden y añade markdown
nuevo_codigo = re.sub(r'^```[a-zA-Z]*\n', '', nuevo_codigo)
nuevo_codigo = re.sub(r'\n```$', '', nuevo_codigo)

# 7. Sobrescribir tu archivo con la versión mejorada
with open(archivo_objetivo, "w") as file:
    file.write(nuevo_codigo.strip())

print("¡Código actualizado con éxito por Gemini!")
