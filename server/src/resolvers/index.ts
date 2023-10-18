import getBook from "./get-book";

const resolvers = {
  Query: {
    book(_parent, args, _contextValue, _info) {
      console.log(args.title)
      return getBook(args.title);
    },
  },
};

export default resolvers;
