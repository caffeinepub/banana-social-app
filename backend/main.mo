import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type UserId = Principal;
  type PostId = Nat32;

  type User = {
    id : UserId;
    username : Text;
    avatarEmoji : Text;
    followersCount : Nat;
    followingCount : Nat;
  };

  type Post = {
    id : PostId;
    authorId : UserId;
    content : Text;
    bananaReactions : Nat;
    timestamp : Time.Time;
  };

  var nextPostId : PostId = 1;

  let users = Map.empty<UserId, User>();
  let posts = Map.empty<PostId, Post>();
  let following = Map.empty<UserId, Map.Map<UserId, ()>>();
  let followers = Map.empty<UserId, Map.Map<UserId, ()>>();

  public shared ({ caller }) func createUser(username : Text, avatarEmoji : Text) : async () {
    if (users.containsKey(caller)) { Runtime.trap("User already exists") };
    let newUser : User = {
      id = caller;
      username;
      avatarEmoji;
      followersCount = 0;
      followingCount = 0;
    };
    users.add(caller, newUser);
  };

  public query ({ caller }) func getUser(id : UserId) : async ?User {
    users.get(id);
  };

  public shared ({ caller }) func createPost(content : Text) : async () {
    let author = switch (users.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };
    let newPost : Post = {
      id = nextPostId;
      authorId = author.id;
      content;
      bananaReactions = 0;
      timestamp = Time.now();
    };
    posts.add(nextPostId, newPost);
    nextPostId += 1;
  };

  public query ({ caller }) func getPosts(start : Nat, limit : Nat) : async [Post] {
    let allPosts = posts.values().toArray().sort(
      func(p1, p2) {
        if (p1.timestamp > p2.timestamp) { return #less };
        if (p1.timestamp < p2.timestamp) { return #greater };
        #equal;
      }
    );
    let end = if (start + limit > allPosts.size()) {
      allPosts.size();
    } else {
      start + limit;
    };
    if (start >= allPosts.size()) { return [] };
    allPosts.sliceToArray(start, end);
  };

  public shared ({ caller }) func reactToPost(postId : PostId) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) {
        let updatedPost : Post = {
          post with
          bananaReactions = post.bananaReactions + 1;
        };
        posts.add(postId, updatedPost);
      };
    };
  };

  public shared ({ caller }) func followUser(followeeId : UserId) : async () {
    if (caller == followeeId) { Runtime.trap("Cannot follow yourself") };
    let followerUser = switch (users.get(caller)) {
      case (null) { Runtime.trap("Follower does not exist") };
      case (?user) { user };
    };
    let followeeUser = switch (users.get(followeeId)) {
      case (null) { Runtime.trap("Followee does not exist") };
      case (?user) { user };
    };

    let followeeFollowers = switch (followers.get(followeeId)) {
      case (null) {
        let newSet = Map.empty<UserId, ()>();
        newSet.add(caller, ());
        followers.add(followeeId, newSet);
        newSet;
      };
      case (?existingSet) {
        if (existingSet.containsKey(caller)) {
          Runtime.trap("Already following");
        };
        existingSet.add(caller, ());
        existingSet;
      };
    };

    let followerFollowing = switch (following.get(caller)) {
      case (null) {
        let newSet = Map.empty<UserId, ()>();
        newSet.add(followeeId, ());
        following.add(caller, newSet);
        newSet;
      };
      case (?existingSet) {
        existingSet.add(followeeId, ());
        existingSet;
      };
    };

    let updatedFollowee : User = {
      followeeUser with
      followersCount = followeeFollowers.size();
    };
    users.add(followeeId, updatedFollowee);

    let updatedFollower : User = {
      followerUser with
      followingCount = followerFollowing.size();
    };
    users.add(caller, updatedFollower);
  };

  public shared ({ caller }) func unfollowUser(followeeId : UserId) : async () {
    if (caller == followeeId) { Runtime.trap("Cannot unfollow yourself") };
    let followerUser = switch (users.get(caller)) {
      case (null) { Runtime.trap("Follower does not exist") };
      case (?user) { user };
    };
    let followeeUser = switch (users.get(followeeId)) {
      case (null) { Runtime.trap("Followee does not exist") };
      case (?user) { user };
    };

    switch (followers.get(followeeId)) {
      case (null) { Runtime.trap("Not currently following") };
      case (?existingSet) {
        if (not existingSet.containsKey(caller)) {
          Runtime.trap("Not currently following");
        };
        existingSet.remove(caller);
        if (existingSet.isEmpty()) {
          followers.remove(followeeId);
        };

        let updatedFollowee : User = {
          followeeUser with
          followersCount = existingSet.size();
        };
        users.add(followeeId, updatedFollowee);
      };
    };

    switch (following.get(caller)) {
      case (null) { Runtime.trap("Not currently following") };
      case (?existingSet) {
        existingSet.remove(followeeId);
        if (existingSet.isEmpty()) {
          following.remove(caller);
        };

        let updatedFollower : User = {
          followerUser with
          followingCount = existingSet.size();
        };
        users.add(caller, updatedFollower);
      };
    };
  };

  public query ({ caller }) func getFollowers(userId : UserId) : async [UserId] {
    switch (followers.get(userId)) {
      case (null) { [] };
      case (?userIdSet) { userIdSet.keys().toArray() };
    };
  };

  public query ({ caller }) func getFollowing(userId : UserId) : async [UserId] {
    switch (following.get(userId)) {
      case (null) { [] };
      case (?userIdSet) { userIdSet.keys().toArray() };
    };
  };
};
