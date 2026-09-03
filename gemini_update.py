import os
from google import genai

try:
    # 1. Validar la existencia de la API KEY
    if "GEMINI_API_KEY" not in os.environ:
        raise ValueError("Falta configurar la variable 'GEMINI_API_KEY' en los Secrets de tu GitHub.")

    # Inicializar el nuevo cliente unificado de Google GenAI
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt_usuario = os.environ.get("ISSUE_BODY", "")

    # Archivos del proyecto CRM-Inmobiplus
    archivos = ["index.html", "style.css", "script.js"]

    # 2. Procesar cada archivo individualmente
    for nombre_archivo in archivos:
        if os.path.exists(nombre_archivo):
            with open(nombre_archivo, "r", encoding="utf-8") as f:
                codigo_actual = f.read()
            
            prompt_final = (
                f"Instrucción general de cambio del usuario:\n{prompt_usuario}\n\n"
                f"Estás editando el archivo específico: '{nombre_archivo}'.\n"
                f"Código actual completo:\n\n{codigo_actual}\n\n"
                f"Aplica los cambios requeridos por el usuario si afectan a este archivo. "
                f"Devuelve el código COMPLETO y actualizado. "
                f"Si este archivo NO requiere cambios, responde UNICAMENTE con la palabra: SIN_CAMBIOS\n\n"
                f"REGLA CRÍTICA: No agregues saludos ni explicaciones. No uses bloques markdown (```html). Devuelve solo el texto plano."
            )
            
            # 🚀 LLAMADA CON EL NUEVO MODELO GEMINI 3.6 FLASH Y LA NUEVA SINTAXIS
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt_final,
            )
            resultado = response.text.strip()
            
            # Limpieza de seguridad por si la IA introduce formato markdown
            if resultado.startswith("```"):
                lineas = resultado.splitlines()
                if len(lineas) > 1 and lineas[0].startswith("```"):
                    lineas = lineas[1:]
                if lineas and lineas[-1].startswith("```"):
                    lineas = lineas[:-1]
                resultado = "\n".join(lineas).strip()
            
            if "SIN_CAMBIOS" in resultado and len(resultado) < 25:
                print(f"ℹ️ El archivo '{nombre_archivo}' no requiere modificaciones.")
            else:
                with open(nombre_archivo, "w", encoding="utf-8") as f:
                    f.write(resultado)
                print(f"✅ ¡Archivo '{nombre_archivo}' actualizado correctamente con Gemini 3.6!")

except Exception as e:
    print(f"❌ ERROR CRÍTICO EN EL SCRIPT: {e}")
    exit(1)
