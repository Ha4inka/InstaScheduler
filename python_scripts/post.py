
import sys
import json
import argparse
from instagrapi import Client

def main():
    parser = argparse.ArgumentParser(description='Post to Instagram')
    parser.add_argument('session_file', help='Path to session file')
    parser.add_argument('media_path', help='Path to media file')
    parser.add_argument('caption', help='Caption for the post')
    parser.add_argument('--first-comment', help='First comment on the post')
    parser.add_argument('--location', help='Location for the post')
    parser.add_argument('--hide-like-count', action='store_true', help='Hide like count')
    parser.add_argument('--tagged-users', help='Comma-separated list of users to tag')
    
    args = parser.parse_args()
    
    try:
        # Load session data
        with open(args.session_file, 'r') as f:
            session_data = json.load(f)
        
        client = Client()
        client.set_settings(session_data['cookies'])
        
        # Prepare usertags if needed
        usertags = []
        if args.tagged_users:
            users = args.tagged_users.split(',')
            for username in users:
                user_id = client.user_id_from_username(username)
                if user_id:
                    usertags.append({
                        "user_id": user_id,
                        "x": 0.5,  # Center of image
                        "y": 0.5   # Center of image
                    })
        
        # Upload the media
        media = client.photo_upload(
            path=args.media_path,
            caption=args.caption,
            usertags=usertags or None,
            location=args.location or None,
            disable_comments=False,
            disable_likes=args.hide_like_count
        )
        
        # Add first comment if specified
        if args.first_comment:
            client.media_comment(media.id, args.first_comment)
        
        print(json.dumps({
            "success": True,
            "mediaId": media.id,
            "code": media.code
        }))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
