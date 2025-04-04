import Account from "@/database/Account";
import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import PostLike from "@/database/PostLike";
import Topic from "@/database/Topic";
import User from "@/database/User";

const models = { Article, Category, Genre, Topic, User, Account, PostLike };

export default models;
