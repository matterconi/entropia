export interface AuthorSummary {
  profileimg: string;
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
  relevance?: number;
}

export interface Series {
  chapters: string[];
  title: string;
  totalChapters: number;
  _id: string;
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
  aiDescription: string;
  createdAt: string;
  series?: Series;
  isSeriesChapter: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profileImg?: string;
  isVerified: boolean;
  bio: string;
  role: string;
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
