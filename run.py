import os
import sys
import webbrowser
import uvicorn

def main():
    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    
    print("=" * 70)
    print("      MINDBRIDGE: AI MENTAL HEALTH SUPPORT FOR STUDENTS")
    print("         Campus Student Mental Health & Early Intervention")
    print("=" * 70)
    print(f"\n[+] Full Stack MindBridge Server starting on: {url}")
    print(f"[+] Interactive OpenAPI Docs: {url}/docs")
    print("\n[+] Pre-configured Login Accounts:")
    print("    * Student Account:    Username: student     | Password: mindbridge123")
    print("    * Campus Counsellor:  Username: counsellor  | Password: mindbridge123")
    print("    * Campus Admin:       Username: admin       | Password: admin123")
    print("    * Custom Student:     Type your own name on the first Login Page!")
    print("\n[+] 24/7 Crisis Helplines Integrated:")
    print("    * Tele-MANAS (Govt of India): 14416 / 1800-891-4416")
    print("    * KIRAN Mental Health:        1800-599-0019")
    print("    * Sneha India Support:        044-24640050")
    print("=" * 70)

    # Open browser automatically after a short delay
    try:
        webbrowser.open(url)
    except Exception:
        pass

    uvicorn.run("backend.main:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    main()
