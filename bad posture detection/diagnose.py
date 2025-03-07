import sys
import os
import importlib.util

def check_module(module_name):
    """Check if a module is installed and print its version if available."""
    try:
        spec = importlib.util.find_spec(module_name)
        if spec is None:
            print(f"❌ {module_name} is NOT installed")
            return False
        
        module = importlib.import_module(module_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"✅ {module_name} is installed (version: {version})")
        return True
    except Exception as e:
        print(f"❌ Error checking {module_name}: {str(e)}")
        return False

def check_environment():
    """Check the Python environment."""
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    print(f"Current working directory: {os.getcwd()}")
    print("\nChecking required modules:")
    
    modules = ['flask', 'flask_cors', 'numpy']
    all_installed = all(check_module(module) for module in modules)
    
    if all_installed:
        print("\nAll required modules are installed! 🎉")
    else:
        print("\nSome required modules are missing. Please install them using:")
        print("pip install -r requirements.txt")
    
    return all_installed

def check_flask_app():
    """Try to import the Flask app and check for issues."""
    try:
        from app import app as flask_app
        print("\n✅ Successfully imported Flask app")
        
        # Check routes
        print("\nRegistered routes:")
        for rule in flask_app.url_map.iter_rules():
            print(f"  {rule.endpoint}: {rule.rule}")
        
        return True
    except Exception as e:
        print(f"\n❌ Error importing Flask app: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Flask Application Diagnostic Tool")
    print("=" * 50)
    
    env_ok = check_environment()
    
    if env_ok:
        app_ok = check_flask_app()
        
        if app_ok:
            print("\nDiagnostic completed successfully! Try running:")
            print("python app.py")
        else:
            print("\nIssues found with the Flask application.")
    
    print("\nPress Enter to exit...")
    input() 