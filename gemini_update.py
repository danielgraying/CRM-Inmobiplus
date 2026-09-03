import os
from google import genai

try:
    if "GEMINI_API_KEY" not in os.environ:
        raise ValueError("Falta configurar la variable 'GEMINI_API_KEY' en los Secrets de tu GitHub.")

    # Inicializar el cliente oficial unificado
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt_usuario = os.environ.get("ISSUE_BODY", "")

    # Archivos clave de tu proyecto CRM-Inmobiplus
    archivos = ["index.html", "style.css", "script.js"]

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
                f"REGLA CRÍTICA: No agregues saludos, notas ni explicaciones. No uses bloques markdown de código (```html). Devuelve solo el texto plano listo para guardar."
            )
            
            # Llamar a Gemini 3.6 Flash de forma directa y limpia
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt_final,
            )
            resultado = response.text.strip()
            
            # Limpiador ultra-seguro sin bucles que causen congelamientos
            resultado = resultado.replace("```html", "").replace("```css", "").replace("```javascript", "").replace("```js", "").replace("```", "").strip()
            
            if "SIN_CAMBIOS" in resultado and len(resultado) < 25:
                print(f"ℹ️ El archivo '{nombre_archivo}' no requiere modificaciones.")
            else:
                with open(nombre_archivo, "w", encoding="utf-8") as f:
                    f.write(resultado)
                print(f"✅ ¡Archivo '{nombre_archivo}' actualizado correctamente!")

except Exception as e:
    print(f"❌ ERROR CRÍTICO EN EL SCRIPT: {e}")
    exit(1)
