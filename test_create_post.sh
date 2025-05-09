#!/bin/bash

# Create a scheduled post with the test image
curl -X POST http://localhost:5000/api/scheduled-content \
  -F "accountId=1" \
  -F "type=post" \
  -F "caption=This is a test post created through the API" \
  -F "scheduledDate=$(date -d '+2 days' '+%Y-%m-%dT%H:%M:%S.000Z')" \
  -F "firstComment=This is the first comment" \
  -F "location=New York" \
  -F "hideLikeCount=true" \
  -F "taggedUsers=[\"user1\",\"user2\"]" \
  -F "media=@uploads/test_post_image.png"