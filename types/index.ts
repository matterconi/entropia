export interface AuthorSummary {
  _id: string;
  username: string;
}

export interface AuthorFull extends AuthorSummary {
  bio?: string;
  articles: string[];
}

export interface CategoriesOrGenresOrTopics {
  id: number;
  name: string;
}

export interface Post {
  _id: string;
  title: string;
  coverImage: string;
  markdownPath: string;
  author?: AuthorSummary | AuthorFull;
  categories: CategoriesOrGenresOrTopics[];
  genres: CategoriesOrGenresOrTopics[];
  topics: CategoriesOrGenresOrTopics[];
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profileImg?: string;
  isAuthor: boolean;
  isVerified: boolean;
  bio: string;
}

export type CategoryKeys =
  | "racconti"
  | "poesie"
  | "saggi"
  | "tutorial"
  | "recensioni"
  | "viaggi"
  | "pensieri";

export type GenreKeys =
  | "romantico"
  | "azione"
  | "avventura"
  | "fantasy"
  | "fantascienza"
  | "horror"
  | "giallo"
  | "drammatico"
  | "storico";

export type TopicKeys =
  | "filosofia"
  | "esistenzialismo"
  | "cinema"
  | "musica"
  | "arte"
  | "politica"
  | "psicologia"
  | "società"
  | "storia"
  | "scienza-e-tecnologia"
  | "spiritualità"
  | "letteratura"
  | "cultura-pop";

export type CategoryMap = Record<CategoryKeys, number>;
export type ArticleMap = Record<CategoryKeys, string>;

export type PageProps = {
  params: { categoria: string };
  searchParams: URLSearchParams;
};
