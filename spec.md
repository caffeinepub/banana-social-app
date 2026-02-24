# Specification

## Summary
**Goal:** Build the initial version of Banana Social, a fun banana-themed social app where users can post content, react with banana emojis, follow other users, and browse a feed.

**Planned changes:**
- Backend Motoko actor with entities: User, Post, and Follow; exposes createUser, getUser, createPost, getPosts (paginated), reactToPost, followUser, unfollowUser, getFollowers, and getFollowing
- Global feed page displaying posts in reverse-chronological order, each with author username, avatar emoji, content, timestamp, and a 🍌 reaction button with count
- Compose Post UI with a 280-character text area and 🍌 submit button that prepends the new post to the feed on success
- User Profile page showing username, avatar emoji, follower/following counts, user posts, and a Follow/Unfollow toggle button
- Banana-themed UI: warm yellow and deep brown color palette, rounded cards, banana emoji accents, cheerful sans-serif typography, and a sticky top navigation bar with links to Feed and Profile; fully mobile-responsive

**User-visible outcome:** Users can create a profile, compose and browse banana-themed posts in a global feed, react to posts with 🍌, and follow or unfollow other users from their profile pages — all wrapped in a bold, playful banana-themed design.
