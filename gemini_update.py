import os
import re
from google import genai

try:
    if "GEMINI_API_KEY" not in os.environ:
        raise ValueError("Falta configurar la variable 'GEMINI_API_KEY' en los Secrets de tu GitHub.")

    # 1. Inicializar el cliente oficial unificado
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt_usuario = os.environ.get("ISSUE_BODY", "")

    # Archivos clave de tu proyecto CRM-Inmobiplus
    archivos = ["index.html", "style.css", "script.js"]
    contexto_codigo = ""

    # 2. Empaquetar todo el proyecto en una sola variable de texto
    for nombre_archivo in archivos:
        if os.path.exists(nombre_archivo):
            with open(nombre_archivo, "r", encoding="utf-8") as f:
                contenido = f.read()
            contexto_codigo += f"=== ARCHIVO_ORIGINAL: {nombre_archivo} ===\n{contenido}\n=== FIN_ARCHIVO_ORIGINAL ===\n\n"

    # 3. Diseñar un súper prompt para hacer una única llamada a la API
    prompt_final = (
        f"Instrucción general de cambio del usuario:\n{prompt_usuario}\n\n"
        f"Aquí tienes el código actual de todo el proyecto:\n\n{contexto_codigo}\n"
        f"Tu tarea es aplicar el cambio solicitado modificando solo los archivos que lo requieran. "
        f"Devuelve tu respuesta estructurada estrictamente usando estos delimitadores exactos para envolver el código de CADA archivo modificado:\n\n"
        f"---INICIO_BLOQUE:{nombre_archivo}---\n"
        f"(Escribe aquí el código completo actualizado del archivo)\n"
        f"---FIN_BLOQUE:{nombre_archivo}---\n\n"
        f"REGLA CRÍTICA: No agregues saludos, explicaciones, ni introducciones fuera de los bloques. "
        f"No uses bloques markdown de código adicionales (como ```html o ```css) dentro de las etiquetas ---INICIO y ---FIN. Solo el texto plano limpio listo para guardar."
    )

    print("🚀 Enviando todo el proyecto a Gemini 3.6 Flash en una única llamada...")
    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=prompt_final,
    )
    respuesta_ia = response.text.strip()

    # 4. Separar y guardar los archivos devueltos por la IA usando expresiones regulares
    bloques = re.findall(r'---INICIO_BLOQUE:(.*?)---(.*?)---FIN_BLOQUE:\1---', respuesta_ia, re.DOTALL)

    if not bloques:
        print("⚠️ Gemini determinó que no hacían falta cambios o no usó el formato de bloques solicitado.")
        print("Respuesta de la IA para revisar:\n", respuesta_ia)
    else:
        for nombre_archivo, nuevo_contenido in bloques:
            nombre_archivo = nombre_archivo.strip()
            
            # Limpieza de seguridad por si la IA ignora las órdenes e introduce triples comillas markdown
            nuevo_contenido = re.sub(r'^```[a-zA-Z]*\n', '', nuevo_contenido)
            nuevo_contenido = re.sub(r'\n```$', '', nuevo_contenido).strip()
            
            if nombre_archivo in archivos:
                with open(nombre_archivo, "w", encoding="utf-8") as f:
                    f.write(nuevo_contenido)
                print(f"✅ ¡Archivo '{nombre_archivo}' actualizado correctamente!")

except Exception as e:
    print(f"❌ ERROR CRÍTICO EN EL SCRIPT: {e}")
    exit(1)
