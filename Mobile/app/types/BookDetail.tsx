import { Author } from "./Author";
import { Category } from "./Category";

export type BookDetail = {
    id: string;
    title: string;
    author: Author[];
    description: string;
    image: string;
    publicationYear: string;
    publisher: string;
    language: string;
    isbn: string;
    format: string;
    price: string;
    category: Category[];
    status: string;
}; 