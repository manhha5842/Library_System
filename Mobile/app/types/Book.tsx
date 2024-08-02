import { Author, Category } from "./";

export type Book = {
    id: string;
    title: string;
    author: Author[];
    category: Category[];
    image: string;
    status: string;
}; 