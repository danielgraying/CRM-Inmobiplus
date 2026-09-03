import os
import re
import google.generativeai as genai

# 1. Configurar Gemini con la API Key gratuita
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
prompt_usuario = os.environ.get("ISSUE_BODY", "")

# 2. Leer los archivos del repositorio para enviarlos como contexto
archivos = ["index.html", "style.css", "script.js"]
contexto_codigo = ""

for nombre_archivo in archivos:
    if os.path.exists(nombre_archivo):
        with open(nombre_archivo, "r", encoding="utf-8") as f:
            contenido = f.read()
        contexto_codigo += f"=== INICIO ARCHIVO ORIGINAL: {nombre_archivo} ===\n{contenido}\n=== FIN ARCHIVO ORIGINAL ===\n\n"

# 3. Instrucciones ultra-específicas para formatear la respuesta
prompt_final = (
    f"Instrucción de cambio solicitada por el usuario:\n{prompt_usuario}\n\n"
    f"Código actual del proyecto:\n{contexto_codigo}\n"
    f"Modifica los archivos necesarios (pueden ser uno, dos o los tres) para cumplir la instrucción.\n"
    f"Devuelve tu respuesta estructurada exactamente usando estos delimitadores para envolver el código de cada archivo modificado:\n\n"
    f"@@@INICIO:{nombre_archivo}@@@\n"
    f"(Escribe aquí el código completo actualizado del archivo)\n"
    f"@@@FIN:{nombre_archivo}@@@\n\n"
    f"Importante: No uses bloques de markdown adicionales (como ```html o ```css) dentro de las etiquetas @@@. Solo el código puro."
)

# 4. Llamar al modelo
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content(prompt_final)
respuesta_ia = response.text

# 5. Extraer y guardar los cambios usando expresiones regulares robustas
bloques = re.findall(r'@@@INICIO:(.*?)@@@(.*?)@@@FIN:\1@@@', respuesta_ia, re.DOTALL)

if not bloques:
    print("❌ Error crítico: Gemini no devolvió los bloques con el formato @@@INICIO y @@@FIN esperado.")
    print("Respuesta cruda de la IA para diagnóstico:\n", respuesta_ia)
    exit(1)

for nombre_archivo, nuevo_contenido in bloques:
    nombre_archivo = nombre_archivo.strip()
    # Limpieza extrema de formato markdown por si la IA ignora las órdenes
    nuevo_contenido = re.sub(r'^```[a-zA-Z]*\n', '', nuevo_contenido)
    nuevo_contenido = re.sub(r'\n```$', '', nuevo_contenido).strip()
    
    if nombre_archivo in archivos:
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            f.write(nuevo_contenido)
        print(f"✅ ¡Archivo '{nombre_archivo}' actualizado correctamente!")
    else:
        print(f"⚠️ Se detectó un intento de modificar un archivo no autorizado: {nombre_archivo}")
