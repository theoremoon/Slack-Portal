export interface User {
    name: string;
    face_image_url: string;
}
export interface Post {
    author: User;
    content: string;
}
export interface Team {
    domain: string;
    name: string;
    channel: string;
    posts: Post[];
    last_modified?: number|null;
}