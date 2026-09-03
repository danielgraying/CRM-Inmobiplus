import os
import re
import google.generativeai as genai

# 1. Configurar Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# 2. Capturar el prompt del usuario
prompt_usuario = os.environ.get("ISSUE_BODY", "")

# 3. Leer los tres archivos principales de tu proyecto
archivos = ["index.html", "style.css", "script.js"]
contexto_codigo = ""

for nombre_archivo in archivos:
    if os.path.exists(nombre_archivo):
        with open(nombre_archivo, "r", encoding="utf-8") as f:
            contenido = f.read()
        contexto_codigo += f"--- ARCHIVO: {nombre_archivo} ---\n{contenido}\n\n"

# 4. Crear un súper prompt donde Gemini analiza todo el contexto
prompt_final = (
    f"Instrucción del usuario: {prompt_usuario}\n\n"
    f"Aquí tienes el código actual de todo el proyecto:\n\n{contexto_codigo}\n"
    f"Tu tarea es decidir qué archivo o archivos deben ser modificados para cumplir con la instrucción del usuario. "
    f"Puedes modificar uno solo, dos, o los tres si es necesario.\n\n"
    f"Devuelve tu respuesta usando estrictamente este formato para cada archivo que decidas cambiar (no agregues texto fuera de estos bloques):\n"
    f"[INICIO_ARCHIVO:nombre_del_archivo]\n"
    f"Aquí pones todo el código completo y actualizado de ese archivo\n"
    f"[FIN_ARCHIVO:nombre_del_archivo]\n"
)

# 5. Llamar a Gemini (Usamos 1.5 Flash)
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content(prompt_final)
respuesta_ia = response.text

# 6. Procesar la respuesta de Gemini y guardar los cambios en los archivos correspondientes
bloques = re.findall(r'\[INICIO_ARCHIVO:(.*?)\](.*?)\[FIN_ARCHIVO:\1\]', respuesta_ia, re.DOTALL)

if not bloques:
    print("⚠️ Gemini no devolvió cambios en el formato solicitado o no consideró necesario cambiar nada.")
    print("Respuesta recibida:", respuesta_ia)
else:
    for nombre_archivo, nuevo_contenido in bloques:
        nombre_archivo = nombre_archivo.strip()
        # Limpieza de seguridad por si Gemini mete marcas markdown de código inside del bloque
        nuevo_contenido = re.sub(r'^```[a-zA-Z]*\n', '', nuevo_contenido)
        nuevo_contenido = re.sub(r'\n```$', '', nuevo_contenido).strip()
        
        if nombre_archivo in archivos:
            with open(nombre_archivo, "w", encoding="utf-8") as f:
                f.write(nuevo_contenido)
            print(f"✅ ¡Archivo '{nombre_archivo}' actualizado con éxito!")
