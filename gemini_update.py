import os
import google.generativeai as genai

# 1. Configurar la API Key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
prompt_usuario = os.environ.get("ISSUE_BODY", "")

# Archivos clave de tu proyecto CRM-Inmobiplus
archivos = ["index.html", "style.css", "script.js"]

# 2. Iterar archivo por archivo para procesarlo individualmente
for nombre_archivo in archivos:
    if os.path.exists(nombre_archivo):
        # Leer el contenido actual del archivo
        with open(nombre_archivo, "r", encoding="utf-8") as f:
            codigo_actual = f.read()
        
        # Súper instrucciones individuales
        prompt_final = (
            f"Instrucción general de cambio solicitada por el usuario:\n{prompt_usuario}\n\n"
            f"Estás editando el archivo específico: '{nombre_archivo}'.\n"
            f"Aquí tienes su código actual completo:\n\n{codigo_actual}\n\n"
            f"Tu tarea:\n"
            f"Aplica los cambios solicitados por el usuario si afectan a este archivo. "
            f"Devuelve el código COMPLETO y actualizado de este archivo. "
            f"Si los cambios del usuario NO afectan o no requieren tocar este archivo, devuelve exactamente y únicamente la palabra: SIN_CAMBIOS\n\n"
            f"REGLA CRÍTICA: No agregues saludos, explicaciones, ni introducciones. No uses bloques de markdown (como ```html o ```css). Devuelve solo el texto plano listo para guardar."
        )
        
        # Llamar a Gemini (Usando el modelo gratuito Flash)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt_final)
        resultado = response.text.strip()
        
        # Limpieza de seguridad por si acaso la IA introduce bloques markdown
        if resultado.startswith("```"):
            lineas = resultado.splitlines()
            if lineas[0].startswith("```"):
                lineas = lineas[1:]
            if lineas and lineas[-1].startswith("```"):
                lineas = lineas[:-1]
            resultado = "\n".join(lineas).strip()
        
        # Analizar respuesta
        if "SIN_CAMBIOS" in resultado and len(resultado) < 20:
            print(f"ℹ️ El archivo '{nombre_archivo}' no requería modificaciones.")
        else:
            # Sobrescribir el archivo con los cambios aplicados
            with open(nombre_archivo, "w", encoding="utf-8") as f:
                f.write(resultado)
            print(f"✅ ¡Archivo '{nombre_archivo}' actualizado correctamente!")
