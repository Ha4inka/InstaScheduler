
import sys
import json
from instagrapi import Client

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "Missing arguments"}))
        return
    
    username = sys.argv[1]
    password = sys.argv[2]
    session_id = sys.argv[3]
    
    try:
        client = Client()
        client.login(username, password)
        
        # Get user info
        user_id = client.user_id
        user_info = client.user_info(user_id)
        
        result = {
            "success": True,
            "user_id": user_id,
            "username": user_info.username,
            "full_name": user_info.full_name,
            "profile_pic_url": user_info.profile_pic_url,
            "cookies": client.get_settings()
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
