import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Post {
    id: PostId;
    content: string;
    authorId: UserId;
    bananaReactions: bigint;
    timestamp: Time;
}
export type UserId = Principal;
export type Time = bigint;
export interface User {
    id: UserId;
    username: string;
    followersCount: bigint;
    avatarEmoji: string;
    followingCount: bigint;
}
export type PostId = number;
export interface backendInterface {
    createPost(content: string): Promise<void>;
    createUser(username: string, avatarEmoji: string): Promise<void>;
    followUser(followeeId: UserId): Promise<void>;
    getFollowers(userId: UserId): Promise<Array<UserId>>;
    getFollowing(userId: UserId): Promise<Array<UserId>>;
    getPosts(start: bigint, limit: bigint): Promise<Array<Post>>;
    getUser(id: UserId): Promise<User | null>;
    reactToPost(postId: PostId): Promise<void>;
    unfollowUser(followeeId: UserId): Promise<void>;
}
