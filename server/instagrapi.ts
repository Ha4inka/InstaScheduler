import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

interface LoginResult {
  success: boolean;
  error?: string;
  profilePic?: string;
  sessionData?: Record<string, any>;
}

interface PostResult {
  success: boolean;
  mediaId?: string;
  error?: string;
}

export class InstagrapiClient {
  private pythonPath = "python3";
  private scriptDir = path.join(process.cwd(), "python_scripts");

  constructor() {
    // Create the python_scripts directory if it doesn't exist
    if (!fs.existsSync(this.scriptDir)) {
      fs.mkdirSync(this.scriptDir, { recursive: true });
    }
    
    // Create the necessary Python scripts
    this.createLoginScript();
    this.createPostScript();
    this.createStoryScript();
  }

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const sessionId = crypto.randomBytes(16).toString("hex");
      const scriptPath = path.join(this.scriptDir, "login.py");
      
      return new Promise<LoginResult>((resolve) => {
        const pythonProcess = spawn(this.pythonPath, [
          scriptPath,
          username,
          password,
          sessionId
        ]);

        let result = "";
        pythonProcess.stdout.on("data", (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          console.error(`Python Error: ${data}`);
        });

        pythonProcess.on("close", (code) => {
          if (code !== 0) {
            return resolve({
              success: false,
              error: "Login failed with code " + code
            });
          }

          try {
            const jsonResult = JSON.parse(result);
            
            // In a real implementation, this would use the actual profile pic URL
            // For this example, we'll use a placeholder
            return resolve({
              success: true,
              profilePic: "https://via.placeholder.com/150",
              sessionData: {
                sessionId,
                cookies: jsonResult.cookies
              }
            });
          } catch (error) {
            return resolve({
              success: false,
              error: "Failed to parse login result"
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during login"
      };
    }
  }

  async createPost(
    sessionData: Record<string, any>,
    mediaPath: string, 
    caption: string, 
    options: {
      firstComment?: string;
      location?: string;
      hideLikeCount?: boolean;
      taggedUsers?: string[];
    } = {}
  ): Promise<PostResult> {
    try {
      const scriptPath = path.join(this.scriptDir, "post.py");
      
      // Create a temporary file with the session data
      const sessionFile = path.join(this.scriptDir, `session_${sessionData.sessionId}.json`);
      fs.writeFileSync(sessionFile, JSON.stringify(sessionData));
      
      return new Promise<PostResult>((resolve) => {
        const args = [
          scriptPath,
          sessionFile,
          mediaPath,
          caption
        ];
        
        if (options.firstComment) args.push("--first-comment", options.firstComment);
        if (options.location) args.push("--location", options.location);
        if (options.hideLikeCount) args.push("--hide-like-count");
        if (options.taggedUsers && options.taggedUsers.length > 0) {
          args.push("--tagged-users", options.taggedUsers.join(","));
        }
        
        const pythonProcess = spawn(this.pythonPath, args);

        let result = "";
        pythonProcess.stdout.on("data", (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          console.error(`Python Error: ${data}`);
        });

        pythonProcess.on("close", (code) => {
          // Clean up the session file
          if (fs.existsSync(sessionFile)) {
            fs.unlinkSync(sessionFile);
          }
          
          if (code !== 0) {
            return resolve({
              success: false,
              error: "Post creation failed with code " + code
            });
          }

          try {
            const jsonResult = JSON.parse(result);
            return resolve({
              success: true,
              mediaId: jsonResult.mediaId
            });
          } catch (error) {
            return resolve({
              success: false,
              error: "Failed to parse post result"
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during post creation"
      };
    }
  }

  async createStory(
    sessionData: Record<string, any>,
    mediaPath: string, 
    caption?: string
  ): Promise<PostResult> {
    try {
      const scriptPath = path.join(this.scriptDir, "story.py");
      
      // Create a temporary file with the session data
      const sessionFile = path.join(this.scriptDir, `session_${sessionData.sessionId}.json`);
      fs.writeFileSync(sessionFile, JSON.stringify(sessionData));
      
      return new Promise<PostResult>((resolve) => {
        const args = [
          scriptPath,
          sessionFile,
          mediaPath
        ];
        
        if (caption) args.push("--caption", caption);
        
        const pythonProcess = spawn(this.pythonPath, args);

        let result = "";
        pythonProcess.stdout.on("data", (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          console.error(`Python Error: ${data}`);
        });

        pythonProcess.on("close", (code) => {
          // Clean up the session file
          if (fs.existsSync(sessionFile)) {
            fs.unlinkSync(sessionFile);
          }
          
          if (code !== 0) {
            return resolve({
              success: false,
              error: "Story creation failed with code " + code
            });
          }

          try {
            const jsonResult = JSON.parse(result);
            return resolve({
              success: true,
              mediaId: jsonResult.mediaId
            });
          } catch (error) {
            return resolve({
              success: false,
              error: "Failed to parse story result"
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during story creation"
      };
    }
  }

  private createLoginScript() {
    const scriptPath = path.join(this.scriptDir, "login.py");
    const scriptContent = `
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
`;
    fs.writeFileSync(scriptPath, scriptContent);
  }

  private createPostScript() {
    const scriptPath = path.join(this.scriptDir, "post.py");
    const scriptContent = `
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
`;
    fs.writeFileSync(scriptPath, scriptContent);
  }

  private createStoryScript() {
    const scriptPath = path.join(this.scriptDir, "story.py");
    const scriptContent = `
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
`;
    fs.writeFileSync(scriptPath, scriptContent);
  }
}
