
import sys
import json
import argparse
from instagrapi import Client

def main():
    parser = argparse.ArgumentParser(description='Post story to Instagram')
    parser.add_argument('session_file', help='Path to session file')
    parser.add_argument('media_path', help='Path to media file')
    parser.add_argument('--caption', help='Caption for the story')
    
    args = parser.parse_args()
    
    try:
        # Load session data
        with open(args.session_file, 'r') as f:
            session_data = json.load(f)
        
        client = Client()
        client.set_settings(session_data['cookies'])
        
        # Determine if it's photo or video
        if args.media_path.endswith(('.jpg', '.jpeg', '.png')):
            media = client.photo_upload_to_story(
                path=args.media_path,
                caption=args.caption
            )
        elif args.media_path.endswith(('.mp4', '.mov')):
            media = client.video_upload_to_story(
                path=args.media_path,
                caption=args.caption
            )
        else:
            raise ValueError("Unsupported media type")
        
        print(json.dumps({
            "success": True,
            "mediaId": media.id,
            "code": media.code
        }))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
