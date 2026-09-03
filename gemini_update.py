import os
import re
import time  # 🚀 Importamos para controlar las pausas de reintento
from google import genai

# Configuración de reintentos para combatir el error 503 por alta demanda
MAX_REINTENTOS = 3
SEGUNDOS_ESPERA = 10

try:
    if "GEMINI_API_KEY" not in os.environ:
        raise ValueError("Falta configurar la variable 'GEMINI_API_KEY' en los Secrets de tu GitHub.")

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt_usuario = os.environ.get("ISSUE_BODY", "")

    archivos = ["index.html", "style.css", "script.js"]
    contexto_codigo = ""

    for nombre_archivo in archivos:
        if os.path.exists(nombre_archivo):
            with open(nombre_archivo, "r", encoding="utf-8") as f:
                contenido = f.read()
            contexto_codigo += f"=== ARCHIVO_ORIGINAL: {nombre_archivo} ===\n{contenido}\n=== FIN_ARCHIVO_ORIGINAL ===\n\n"

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

    respuesta_ia = None
    
    # 🚀 BUCLE DE CONTROL: Intenta comunicarse con Google de forma persistente
    for intento in range(1, MAX_REINTENTOS + 1):
        try:
            print(f"🚀 Enviando proyecto a Gemini 3.6 Flash (Intento {intento}/{MAX_REINTENTOS})...")
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt_final,
            )
            respuesta_ia = response.text.strip()
            # Si la llamada fue exitosa, rompemos el bucle de reintentos de inmediato
            break
        except Exception as api_error:
            print(f"⚠️ El servidor de Google respondió con un error en el intento {intento}: {api_error}")
            if intento < MAX_REINTENTOS:
                print(f"⏳ Servidores saturados. Esperando {SEGUNDOS_ESPERA} segundos antes de volver a intentar...")
                time.sleep(SEGUNDOS_ESPERA)
            else:
                # Si agota todos los reintentos, eleva el error definitivo
                raise api_error

    if not respuesta_ia:
        raise ValueError("No se pudo obtener una respuesta válida de Gemini tras múltiples intentos.")

    # Separar y guardar los archivos devueltos por la IA
    bloques = re.findall(r'---INICIO_BLOQUE:(.*?)---(.*?)---FIN_BLOQUE:\1---', respuesta_ia, re.DOTALL)

    if not bloques:
        print("⚠️ Gemini determinó que no hacían falta cambios o no usó el formato solicitado.")
    else:
        for nombre_archivo, nuevo_contenido in bloques:
            nombre_archivo = nombre_archivo.strip()
            nuevo_contenido = re.sub(r'^```[a-zA-Z]*\n', '', nuevo_contenido)
            nuevo_contenido = re.sub(r'\n```$', '', nuevo_contenido).strip()
            
            if nombre_archivo in archivos:
                with open(nombre_archivo, "w", encoding="utf-8") as f:
                    f.write(nuevo_contenido)
                print(f"✅ ¡Archivo '{nombre_archivo}' actualizado correctamente!")

except Exception as e:
    print(f"❌ ERROR CRÍTICO EN EL SCRIPT: {e}")
    exit(1)
