export interface Recv {
    /**
     * Received data type interface
     */
    typename: string;
    value: any;
}

export interface Result {
    result: boolean;
    message: string;
}

export interface Author {
    name: string;
    face_image_url: string;
}
export interface Post {
    author: Author;
    content: string;
}
export interface Team {
    domain: string;
    name: string;
    channel: string;
    posts: Post[];
    last_modified?: number|null;
}